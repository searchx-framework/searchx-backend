'use strict';

const cheerio = require('cheerio');
const e = require('express');
const { ConstantNodeDependencies } = require('mathjs');
exports.index = 'amazon';
exports.queryField = 'title';

exports.formatHit = function (hit) {
    const source = hit._source;
    const title = source.title ? source.title.replace(/\s+/g, " ") : "";
    const rating = source.rating ? source.rating : 0;
    const count = source.count_reviews ? source.count_reviews : 0;
    const reviews = source.reviews ? source.reviews : [];
    return {
        id: hit._id,
        name: title,
        price: source.price,
        brand: source.brand,
        image: source.imUrl,
        description: source.description,
        rating : rating,
        count: count,
        reviews: reviews
    };
};

exports.formatAggregation = function (name, result) {
  let formatedAggregation = [];
  let aggregations = result[name];
  if (name === "Price Facet") {
    let bucketCount = 1;
    let sumDocCount = aggregations.buckets[0].doc_count;
    let key = aggregations.buckets[0].key;
    let bucketSizeToMerge = aggregations.buckets.length/5;
    for (let i = 1; i < aggregations.buckets.length-1; i++) {
      sumDocCount+= aggregations.buckets[i].doc_count;
      bucketCount++
      if (bucketCount > bucketSizeToMerge) {
        formatedAggregation.push([key, aggregations.buckets[i].key, sumDocCount])
        bucketCount = 0;
        sumDocCount = 0;
        key = aggregations.buckets[i].key;
      }
    }
    formatedAggregation.push([key,  sumDocCount])
  } else if (name == "Rating Facet") {
    for (let rating = 1; rating < 5; rating++) {
      let totalSum = 0;
      for (let i = 1; i < aggregations.buckets.length; i++) {
        if (aggregations.buckets[i].key >= rating) {
          totalSum += aggregations.buckets[i].doc_count;
        }
      }
      if (totalSum > 0) {
        formatedAggregation.push([rating, totalSum])
      }
    }
    formatedAggregation = formatedAggregation.reverse();
  }
  else {
    formatedAggregation = aggregations.buckets.map (x => [x.key, x.doc_count] )
  }
  return formatedAggregation;
}

exports.getQuery = function (query, vertical, filters) {
  let facets = {
    "Category Facet": {
      "terms": {
        "field": "categories.keyword",
        "size": 10
      }
    },
    "Brand Facet": {
      "terms": {
        "field": "brand.keyword",
        "size": 10
      }
    },
    "Price Facet": {
      "histogram": {
        "field": "price", 
        "interval": 10
      }
    },
    "Rating Facet" : {
      "histogram": {
        "field": "rating", 
        "interval": 1
      }
    }
  }

  let filtered_query = []
  if ("price" in filters) {
    let prices = filters["price"].split("-")
    if (prices.length === 2) {
      filtered_query.push({ "range" : { "price" : 
      {
      "gte" : prices[0],
      "lte" : prices[1]
      }
      }})
    }
    else {
      filtered_query.push({ "range" : { "price" : 
      {
      "gte" : prices[0]
      }
      }})
    }
  }
  if ("brand" in filters) {
    filtered_query.push({
      "terms" : {"brand.keyword" : filters.brand}
    })
  }

  if ('rating' in filters) {
    filtered_query.push({ "range" : { "rating" : 
    {
    "gte" : filters.rating
    }
    }})
  }
  let categories = []
  if ("categories" in filters) {
    let categories = filters.categories
    if (vertical !== "All") {
      categories.push(vertical);
    }
    filtered_query.push({
      "term" : {"categories.keyword" : categories}
    })
  } else if (vertical !== "All") {
    categories.push(vertical);
    filtered_query.push({
      "term" : {"categories.keyword" : categories}
    })
  }
  return {
    "aggs": facets,
    "query": {

      "function_score": {
        "query" : {
                    "bool": {
                      "must": [
                        {
                          "multi_match": {
                            "fields": [
                              "title^7",
                              "description^2"
                            ],
                            "operator": "AND",
                            "type": "best_fields",
                            "query": query
                          }
                        }
                      ],
                      filter : filtered_query,
                      "should": [
                        {
                          "multi_match": {
                            "fields": [
                              "title^7",
                              "description^2"
                            ],
                            "operator": "OR",
                            "type": "best_fields",
                            "query": query
                          }
                        },
                        {
                          "multi_match": {
                            "fields": [
                              "title^7",
                              "description^2"
                            ],
                            "operator": "OR",
                            "type": "best_fields",
                            "query": query
                          }
                        }
                      ]
                    }
                  },
        "script_score": {
          "script": {
            "params": {
              "a": 5,
              "b": 1.2
            },
            "source": "if (doc.rating.size() == 0) {return 0} else {doc.rating.value * doc.count_reviews.value}"
          }
        }
      }
    }
  }
};


