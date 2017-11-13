module.exports = {

    // this file is not committed to git
    
    'secret': process.ENV.SECRET, // secret token for jwt
    'database': process.ENV.PROD_MONGODB // uri for connection to database

};