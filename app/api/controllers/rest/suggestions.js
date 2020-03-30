'use strict';

const suggestions = require('../../../services/suggestions');

exports.suggestions = function(req, res) {
    const userId = req.query.userId || '';
    const sessionId = req.query.sessionId || '';

    const query = req.query.query || '';

    suggestions.getQuerySuggestions(query, sessionId, userId)
    .then((data) => {
        res.status(200).json(data);
    })
    .catch(err => handleError(err));

}


function handleError(err) {
    console.log(err);

    if (err.name === 'Bad Request') {
        res.status(400).json({
            error: true,
            message: err.message
        });
    } else {
        res.status(503).json({
            error: true,
            message: 'The request resulted in a backend time out or backend error. The team is investigating the issue. We are sorry for the inconvenience.'
        });
    }
}