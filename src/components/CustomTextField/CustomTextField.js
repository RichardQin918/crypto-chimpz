import React from 'react';
import {makeStyles,} from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import CancelIcon from '@material-ui/icons/Cancel';
import NumberFormat from 'react-number-format';
import IconButton from '@material-ui/core/IconButton';

import './CustomTextField.css';

import InputAdornment from '@material-ui/core/InputAdornment';

const useStylesInput = makeStyles((theme) => ({
    root: {

        'label + &': {
            marginTop: theme.spacing(3),
        },

        // 'label.Mui-focused': {
        //   color: 'green',
        // },
        '&:hover': {
            backgroundColor: '#1B2A8C',
        },
        '&$focused': {
            backgroundColor: '#1F32B4',
        },
        backgroundColor: '#251f68',
        borderRadius: 16,
        alignItems: 'center',
        // backgroundColor: 'red',
        overflow: 'hidden'
    },

    input: {
        position: 'relative',
        // backgroundColor: '#1F32B4',
        fontSize: 36,
        // width: 'auto',
        padding: '10px 12px',
        color: 'white',

        fontFamily: [
            'Arial',
        ].join(','),

        '&:focused': {
            color: '#1DF0A9'
        }
    }


}));


export default function CustomTextField(props) {
    const classes = useStylesInput();
    return <TextField
        id="filled-full-width"
        margin="normal"
        InputLabelProps={{ className: "textfield__label" }}
        FormHelperTextProps={{ className: "textfield__helperText" }}
        variant="filled"
        InputProps={{
            classes, disableUnderline: true,
            inputComponent: props.customtype === "number" ? props.int ? IntFormatCustom: NumberFormatCustom: undefined,
            endAdornment:
                <InputAdornment position="end" style={{ height: '100%', justifyContent: 'flex-end', margin: 0 }}>

                    {props.rightbuttonlabel === "" ?
                        null
                        :

                        <IconButton position="end"
                                    style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}
                                    onClick={props.onrightbuttonclick}
                                    disabled={props.onrightbuttondisable}
                        >
                            {props.rightbuttonlabel}
                        </IconButton>

                    }

                    {props.showcancellbutton ?

                        <CancelIcon style={{color:'white'}} onClick={props.clear} />
                        :
                        null
                    }
                </InputAdornment>


        }

        }
        {...props}
        autoCapitalize="off"
        autoComplete="off"
        autoCorrect="off"
    >

    </TextField>
}

function NumberFormatCustom(props) {
    const { inputRef, onChange, ...other } = props;
    return (
        <NumberFormat
            {...other}
            getInputRef={inputRef}
            onValueChange={(values) => {
                onChange({
                    target: {
                        name: props.name,
                        value: values.value,
                    },
                });
            }}
            allowNegative={false}
            decimalScale={8}
        />
    );
}

function IntFormatCustom(props) {
    const { inputRef, onChange, ...other } = props;
    return (
        <NumberFormat
            {...other}
            getInputRef={inputRef}
            onValueChange={(values) => {
                onChange({
                    target: {
                        name: props.name,
                        value: values.value,
                    },
                });
            }}
            allowNegative={false}
            decimalScale={0}
        />
    );
}


