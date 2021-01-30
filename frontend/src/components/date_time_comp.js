import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';

const useStyles = makeStyles((theme) => ({
    container: {
        display: 'flex',
        flexWrap: 'wrap',
    },
    textField: {
        marginLeft: theme.spacing(1),
        marginRight: theme.spacing(1),
        width: 200,
    },
}));

export default function DateAndTimePickers(input_props) {
    const classes = useStyles();

    return (
        <TextField
            id="datetime-local"
            label="Enter date time"
            type="datetime-local"
            name={input_props.expected_name}
           // defaultValue="2017-05-24T10:30"
            className={classes.textField}
            onChange={e => input_props.onChange(e)}
            value={input_props.sent_value}
            InputLabelProps={{
                shrink: true,
            }}
        />
    );
}
