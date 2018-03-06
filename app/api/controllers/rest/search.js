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

    search.search(query, vertical, pageNumber, sessionId, userId, providerName)
        .then((data) => {
            scrap.scrapPage(data.results);
            res.status(200).json(data);
        })
        .catch((err) => {
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
        });
};