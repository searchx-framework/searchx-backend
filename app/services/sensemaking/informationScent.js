'use strict';

const mongoose = require('mongoose');
const Aspect = mongoose.model('Aspect');
const Coverage = mongoose.model('Coverage');
const queryMatching = require('./queryMatching');
const indri = require('../../../lib/node-indri/node-indri');

const indri_scorer = new indri.Scorer({
    "index": process.env.INDRI_INDEX,
    "rules": "method:dirichlet,mu:2500"
})


const findAspects = async function (id) {
    const aspects = await Aspect.findOne({
        id: id
    });
    return aspects;
}

const insertAspects = async function(id, aspects) {
    
    let novelty = {}
    let centroidvectors = {}
    for (var i in aspects) {
        novelty[aspects[i]] = 1.0;
        centroidvectors[aspects[i]] = await queryMatching.computeCentroidWordVector(aspects[i].split(" "));
    }
    const data = {
        id: id,
        aspects: aspects,
        novelty: novelty,
        documents: new Map,
        centroidvectors: centroidvectors
    }
    const A = new Aspect(data);
    A.save();
}


const computeCoverage = async function(id, aspects) {


    const promisesAspects = aspects.map(async (aspect) => {
        return new Promise((resolve, reject) => {
                const callback = function (error, results) {
                    if (error) return reject(error);
                    resolve(results);
                };

                indri_scorer.score(aspect, [], 10, callback);
        });
    });

    const docs = new Map();

    const results  = await Promise.all(promisesAspects);
    for (var i in results){
        for (var j in results[i]) {
            docs.set(results[i][j].docid,1);
        }
    }

    let docsIds = Array.from(docs.keys());
    console.log(docsIds);
    const promisesCoverage = aspects.map(async (aspect) => {
        return new Promise((resolve, reject) => {
                const callback = function (error, results) {
                    if (error) return reject(error);
                    resolve(normalise(results));
                };
                indri_scorer.score(aspect, docsIds, docs.size, callback);
        });
    });

    const coveragesValues  = await Promise.all(promisesCoverage);

    var coverages = new Array();

    for (i in aspects) {
        for (j in coveragesValues[i]) {
            coverages.push ( {
                    id: id,
                    aspect: aspects[i],
                    coverage : coveragesValues[i][j].score,
                    docid: coveragesValues[i][j].docid
                }
            )
            
        }
    }

    Coverage.insertMany(coverages);
} 

const normalise = function(docs) {
    var totalScore = 0;
    for (var i in docs) {
        totalScore += docs[i].score;
    }

    for (var i in docs) {
        docs[i].score /= totalScore;
    }

    return docs;

}



exports.singleInformationScent = async function(userId, suggestions) {

    let userAspects = await findAspects(userId);

    if (userAspects === null) {
        insertAspects(userId, suggestions);
        computeCoverage(userId, suggestions);
        return suggestions.map((suggestion) => { return [suggestion, 1.0]});
    }

    let suggestionsCentroidVectors = suggestions.map( (suggestion) => {
        return queryMatching.computeCentroidWordVector(suggestion.split(" "));
    });

    suggestionsCentroidVectors = await Promise.all(suggestionsCentroidVectors);

    let infoScents = suggestionsCentroidVectors.map((v) => aspectInformationScent(v, userAspects.novelty, userAspects.centroidvectors))
    let infoScentsSuggestion = []
    for (let i in infoScents) {
        infoScentsSuggestion.push([suggestions[i], infoScents[i]]);
    }

    return infoScentsSuggestion;

}

exports.collaborativeInformationScent = async function(userId, sessionId, suggestions) {

    const singleUserInfoScent = await this.singleInformationScent(userId, suggestions);
    const collaborativeUserInfoScent = await this.singleInformationScent(sessionId, suggestions);

    let scents = []
    for (let i in suggestions) {
        scents.push([suggestions[i], singleUserInfoScent[i][1], collaborativeUserInfoScent[i][1]])
    }

    return scents
}


exports.handleUserLogs = async function(logs){
    if (process.env.INFOSCENT_TYPE === "noscent") {
        return;
    }
    for (let i in logs) {
        if (logs[i].event === "SEARCHRESULT_CLICK_URL" || logs[i].event === "SEARCHRESULT_CONTEXT_URL") {
            let userId = logs[i].userId;
            let sessionId = logs[i].sessionId;
            let docid = logs[i].meta.url;

            let userAspects = await findAspects(userId);
            if (userAspects === null) {
                return;
            }
            if (! userAspects.documents.has(docid)) {
            
                Coverage.find( {
                    "id": sessionId,
                    "docid" : docid

                } , function(error,response) {
                        if (!error) {
                            for (let r in response) {
                                let novelty = userAspects.novelty.get(response[r].aspect);
                                userAspects.novelty.set(response[r].aspect, novelty*(1-response[r].coverage));
                            }
                            userAspects.documents.set(docid, 1);
                            userAspects.save();
                        }
                    }
                );
            }

            if (process.env.INFOSCENT_TYPE === "collaborative") {
                let sessionAspects = await findAspects(sessionId);
                if (sessionAspects === null) {
                    return;
                }

                if (sessionAspects.documents.has(docid)) {
                    continue;
                }
                Coverage.find( {
                    "id": sessionId,
                    "docid" : docid
    
                } , function(error,response) {
                        if (!error) {
                            for (let r in response) {
                                let novelty = sessionAspects.novelty.get(response[r].aspect);
                                sessionAspects.novelty.set(response[r].aspect, novelty*(1-response[r].coverage));
                            }
                            sessionAspects.documents.set(docid, 1);
                            sessionAspects.save();
                        }
                    }
                )
            }

        }
    }
}

const aspectInformationScent = function(suggestionCentroidVector, novelty, centroidvectors){

    let selectedAspect = null;
    let selectedDistance = 2; 
    for (const [key, value] of novelty.entries()) {
        let distance = queryMatching.cosineSim(centroidvectors.get(key),suggestionCentroidVector);
        if (distance < selectedDistance) {
            selectedDistance = distance;
            selectedAspect = key;
        }
    }
    
    if (selectedAspect !== null) {
        return [ 1-selectedDistance, (1-selectedDistance)*novelty.get(selectedAspect) ];
    } 

    return 1;
}
