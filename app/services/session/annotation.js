'use strict';

const mongoose = require('mongoose');
const Annotation = mongoose.model('Annotation');

////

exports.getAnnotations = async function(sessionId, url) {
    return await Annotation
        .find(
            {sessionId: sessionId, url: url, deleted: false},
            {userId: 1, url: 1, annotation: 1, created: 1, _id: 1}
        )
        .sort({created: 1});
};

exports.addAnnotation = async function(sessionId, data) {
    data.sessionId = sessionId;
    data.created = new Date();
    const A = new Annotation(data);
    A.save();
};

exports.removeAnnotation = async function(sessionId, url, annotationId) {
    const doc = await Annotation.findOne({
        sessionId: sessionId,
        url: url,
        _id: annotationId
    });

    if (!doc) {
        throw new Error('Annotation does not exist');
    }

    doc.deleted = true;
    doc.save();
};