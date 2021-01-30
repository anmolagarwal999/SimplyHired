import React from 'react';
import Alert from 'react-bootstrap/Alert';


const Error_notification = ({ message }) => {
    if (message === null) {
        return null;
    }
    return (
        <Alert key={message} variant={"danger"}>
            Error: {message}
        </Alert>
    )
};

const Success_notification = ({ message }) => {
    if (message === null) {
        return null;
    }
    return (
        <Alert key={message} variant={"success"}>
            Success: {message}
        </Alert>
    )
};

export { Error_notification, Success_notification };