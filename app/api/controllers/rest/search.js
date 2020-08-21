'use strict';

const search = require('../../../services/search');
const scrap = require('../../../services/scrap');
const config = require('../../../config/config');

exports.search = function(req, res) {
    const userId = req.body.userId || '';
    const sessionId = req.body.sessionId || '';

    const query = req.query.query || '';
    const vertical = req.params.vertical;
    const pageNumber = parseInt(req.query.page) || 1;
    const filters = req.body.filters || [];
    const providerName = req.query.providerName || process.env.DEFAULT_SEARCH_PROVIDER;
    let relevanceFeedback = req.query.relevanceFeedback || 'shared';
    let distributionOfLabour = req.query.distributionOfLabour || 'false';

    search.search(query, vertical, filters, pageNumber, sessionId, userId, providerName, relevanceFeedback, distributionOfLabour)
        .then((data) => {
            if (config.enableScrap) {
                scrap.scrapPage(data.results);
            }
            res.status(200).json(data);
        })
        .catch(err => handleError(err));
};

exports.getById = function (req, res) {
    const docId = req.params.id;
    const providerName = req.query.providerName || process.env.DEFAULT_SEARCH_PROVIDER;

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
