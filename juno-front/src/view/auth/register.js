import { Button, TextField } from '@material-ui/core';
import React from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { change, register } from '../../store/actions/register.action';
import MaskedInput from 'react-text-mask'

const TextMaskCustom = (props) => {
    const { inputRef, ...other } = props;
    let mask = [];

    if(props.name === 'cpf') {
        mask = [/[0-9]/, /\d/, /\d/, '.', /\d/, /\d/, /\d/, '.', /\d/, /\d/, /\d/, '-', /\d/, /\d/]
    }

    if(props.name === 'phone') {
        mask = ['(', /[0-9]/, /\d/ , ')', ' ', /\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/,/\d/, /\d/]
        if(other.value) {
            if(other.value.length === 15) {
                mask = ['(', /[0-9]/, /\d/ , ')', ' ', /\d/, /\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/,/\d/]
            }
        }
    }

    return (
        <MaskedInput
            {...other}
            ref={ref => {
                inputRef(ref ? ref.inputElement : null)
            }}
            mask={mask}
            guide={false}
        />
    )
}

export default function Register() {
    const dispatch = useDispatch();
    const { user, error } = useSelector(state => state.registerReducer)

    const [ state, setState ] = React.useState(JSON.parse(localStorage.getItem('user')) || {})

    React.useEffect(() => {
        dispatch(change(state))
    }, [])

    return (
        <div className="row">
            <div className="col-md-6 mb-3">
                <label className="label-custom">Nome</label>
                <TextField
                    error={(error.name) && true}
                    value={(user.name || state.name) || ''}
                    placeholder="Digite seu nome"
                    onChange={text => {
                        dispatch(change({ name: text.target.value }))
                        if(error.name && delete error.name);
                    }}
                />
                {(error.name) &&
                    <strong className="text-orange d-block mt-2">{error.name.msg}</strong>
                }
            </div>

            <div className="col-md-6 mb-3">
                <label className="label-custom">Email</label>
                <TextField
                    error={(error.email) && true}
                    type="email"
                    autoComplete="email"
                    placeholder="Digite seu email"
                    value={(user.email || state.email) || ''}
                    onChange={text => {
                        dispatch(change({ email: text.target.value }))
                        if(error.email && delete error.email);
                    }}
                />
                {(error.email) &&
                    <strong className="text-orange d-block mt-2">{error.email.msg}</strong>
                }
            </div>

            <div className="col-md-6 mb-3">
                <label className="label-custom">Telefone</label>
                <TextField
                    error={(error.phone) && true}
                    name="phone"
                    type="tel"
                    autoComplete="off"
                    placeholder="(00) 00000-0000"
                    InputProps={{
                        inputComponent: TextMaskCustom,
                        value: (user.phone || state.phone) || '',
                        onChange: text => {
                            dispatch(change({ phone: text.target.value }))
                            if(error.phone && delete error.phone);
                        }
                    }}
                />
                {(error.phone) &&
                    <strong className="text-orange d-block mt-2">{error.phone.msg}</strong>
                }
            </div>

            <div className="col-md-6 mb-3">
                <label className="label-custom">CPF</label>
                <TextField
                    error={(error.cpf) && true}
                    name="cpf"
                    type="tel"
                    autoComplete="off"
                    placeholder="000.000.000-00"
                    InputProps={{
                        inputComponent: TextMaskCustom,
                        value: (user.cpf || state.cpf) || '',
                        onChange: text => {
                            dispatch(change({ cpf: text.target.value }))
                            if(error.cpf && delete error.cpf);
                        }
                    }}
                />
                {(error.cpf) &&
                    <strong className="text-orange d-block mt-2">{error.cpf.msg}</strong>
                }
            </div>

            <div className="d-flex">
                <button
                    className="mt-4 mb-4 btn btn-dark btn-lg rounded-0"
                    onClick={() => dispatch(register(user)).then(res => res && window.location.reload())}
                >
                Continuar
                </button>
                <div className="d-flex align-items-center ms-3">
                    <Button onClick={() => {
                        dispatch(change('clear'))
                        localStorage.removeItem('user')
                        localStorage.removeItem('access_token')
                        setState({})
                    }}>Limpar</Button>
                </div>
            </div>
        </div>
    )
}