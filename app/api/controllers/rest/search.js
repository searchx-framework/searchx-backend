'use strict';

const search = require('../../../services/search');
const scrap = require('../../../services/scrap');
const config = require('../../../config/config');

exports.search = function(req, res) {
    const userId = req.query.userId || '';
    const sessionId = req.query.sessionId || '';

    const query = req.query.query || '';
    const vertical = req.params.vertical;
    const pageNumber = parseInt(req.query.page) || 1;
    const providerName = req.query.providerName || config.defaultProvider;
    let relevanceFeedback = req.query.relevanceFeedback || 'shared';
    if (relevanceFeedback === 'false') {
        relevanceFeedback = false;
    }
    let distributionOfLabour = req.query.distributionOfLabour || 'unbookmarkedSoft';
    if (distributionOfLabour === 'false') {
        distributionOfLabour = false;
    }

    search.search(query, vertical, pageNumber, sessionId, userId, providerName, relevanceFeedback, distributionOfLabour)
        .then((data) => {
            // TODO: enable page scraping for providers that need it
            // scrap.scrapPage(data.results);
            res.status(200).json(data);
        })
        .catch(err => handleError(err));
};

exports.getById = function (req, res) {
    const docId = req.params.id;
    const providerName = req.query.providerName || config.defaultProvider;

    search.getById(docId, providerName)
        .then(data => res.status(200).json(data))
        .catch(err => handleError(err));
};

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