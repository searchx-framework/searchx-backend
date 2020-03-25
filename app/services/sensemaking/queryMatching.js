'use strict';

const mongodb = require('mongodb');
const math = require('mathjs');

const url = "mongodb://localhost:27017/";


exports.computeCentroidWordVector = async function(words) {
    let vectors = words.map((word) => { 
        
        return new Promise( (resolve,reject) => {

            mongodb.MongoClient.connect(url, function(err, db) {
                if (err) throw err;
                const searchxExtras = db.db("searchx-extras");
                searchxExtras.collection("word2vec-googlenews").findOne({"_id" : word}, function(err, result) {
                if (err) reject(error);;
                if (result !== null) {
                    resolve(result["vector"]);
                }
                resolve([]);
                db.close();
                
            });    
        });

        });
    });

    vectors = await Promise.all(vectors);
    vectors = vectors.filter(vector =>vector.length)
    if (vectors.length === 0) {
        return [];
    } else if (vectors.length === 1) {
        return vectors[0];
    }
    let centroid = math.add(...vectors);
    centroid = math.divide(centroid, words.length);
    return centroid;

}

exports.cosineSim = function(vecA, vecB){
    if (vecA.length === 0 || vecB.length === 0 ) {
        return 1;
    } 
    const dotProdut = math.dot(vecA, vecB);
    const normA = math.norm(vecA);
    const normB = math.norm(vecB);
    return 1 - dotProdut/(normA*normB);
}

