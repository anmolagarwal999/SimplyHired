
const requestLogger = (request, response, next) => {
    console.log("##################################");
    console.log('Method:', request.method);
    console.log('Path:  ', request.path);
    console.log('Body:  ', request.body);
    console.log('---');
    next();
}


////////////////////////////////////////////
//Error if invalid URL was entered
/*
Middleware functions have to be taken into use before routes if we want them to be executed before the route event handlers are called. There are also situations where we want to define middleware functions after routes. In practice, this means that we are defining middleware functions that are only called if no route handles the HTTP request.
Let's add the following middleware after our routes, that is used for catching requests made to non-existent routes. For these requests, the middleware will return an error message in the JSON format.
*/

const unknownEndpoint = (request, response, next) => {
    response.status(404).send("<h1>MASSIVE ERROR (ENDPOINT NOT FOUND)</h1>");
    next();
}

// app.use(unknownEndpoint);
//////////////////////////////////////////
const errorHandler = (error, request, response, next) => {
    console.error("####" + error.message);

    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' });
    }
    else if (error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message });
    }
    else if (error.name === 'JsonWebTokenError') {
        return response.status(401).json(
            {
                error: 'invalid token'
            });
    }



    next(error);
}

module.exports = {
    requestLogger,
    unknownEndpoint,
    errorHandler
}