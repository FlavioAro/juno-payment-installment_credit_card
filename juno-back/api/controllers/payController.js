const http = require('../../config/http')
const config = require('config')
const Users = require('../../models/users')
const Products = require('../../models/products')
const Coupons = require('../../models/coupons')
const Transactions = require('../../models/transactions')

const getCharge = async (request) => {
    let coupon = null;
    let totalCart = 0;
    let discount = 0;

    if(request.coupon) {
        if(request.coupon.id) {
            coupon = await Coupons.findOne({ where: { id: request.coupon.id } })
        }
    }
    let data = {
        description: config.get('app_name')
    };
    
    await Promise.all(request.itens.map(async (item) => {
        let prod = await Products.findOne({ where: { id: item.id } })
        if(prod) {
            totalCart += prod.price * item.qtd;
        }
        return item;
    }));

    if(coupon) {
        discount = (totalCart / 100) * coupon.discount
    }
    totalCart = totalCart - discount
    totalCart = totalCart.toFixed(2)
    
    if(request.installments > 1){
        data.installments = request.installments
        data.totalAmount = totalCart
    }else {
        data.amount = totalCart
    }

    return data;
}

exports.coupons = async (req, res) => {
    let coupon = await Coupons.findOne({ where: { code: req.params.code } })

    if(coupon){
        return res.status(200).json({
            id: coupon.id,
            code: coupon.code,
            discount: coupon.discount
        });
    }

    return res.status(400).json({
        error: 'Cupom inválido'
    });
}

exports.card = async (req, res) => {
    let product = await getCharge(req.body, );
    let charge = await http.post('charges', {
        'charge': {
            ...product,
            "paymentTypes": ["CREDIT_CARD"]
        },
        'billing' : {
            'name': req.body.name,
            'document': req.body.document
        }
    })
    .then(response => response.data)
    .catch(error => error.response && res.status(400).json(error.response.data.details))
    let payment = await http.post('payments', {
        "chargeId": charge._embedded.charges[0].id,
        "billing": req.body.billing,
        "creditCardDetails": {
            "creditCardHash": req.body.cardHash
        }
    })
    .then(response => response.data)
    .catch(error => error.response && res.status(400).json(error.response.data.details))

    if(payment) {
        const transaction = await Transactions.create({
            transactionId: payment.transactionId,
            installments: payment.installments,
            payments: JSON.stringify(payment.payments)
        })
    }

    return res.status(200).json(charge._embedded.charges[0]);
}

exports.boleto = async (req, res) => {
    let product = await getCharge(req.body);
    let charge = await http.post('charges', {
        'charge': {
            ...product,
            "paymentTypes": ["BOLETO"]
        },
        'billing' : {
            'name': req.body.name,
            'email': req.body.email,
            'document': req.body.document
        }
    })
    .then(response => response.data)
    .catch(error => error.response && res.status(400).json(error.response.data.details))

    return res.status(200).json(charge._embedded.charges[0]);
}

exports.picpay = async (req, res) => {
    let product = await getCharge(req.body);
    let charge = await http.post('charges', {
        'charge': {
            ...product,
            "paymentTypes": ["CREDIT_CARD"]
        },
        'billing' : {
            'name': req.body.name,
            'document': req.body.document
        }
    })
    .then(response => response.data)
    .catch(error => error.response && res.status(400).json(error.response.data.details))
    
    let today = new Date()
    let vencimento = today.setDate(today.getDate() + 5)
    let picpay = await http.post('qrcode', {
        "chargeCode": charge._embedded.charges[0].code,
        "type": "PICPAY",
        "expiresAt": new Date(vencimento).toISOString().slice(0, 10)
    })
    .then(response => response.data)
    .catch(error => error.response && res.status(400).json(error.response.data.details))

    return res.status(200).json(picpay);
}

exports.pix = async (req, res) => {
    let product = await getCharge(req.body);
    let charge = await http.post('pix/qrcodes/static', {
        'includeImage': true,
        'key': config.get('pix-key'),
        'amount': product.amount
    })
    .then(response => response.data)
    .catch(error => error.response && res.status(400).json(error.response.data.details))
    
    return res.status(200).json(charge);
}

exports.charge = async (req, res) => {
    let charge = await http.get('charges/'+req.params.id)
    .then(response => response.data)
    .catch(error => error.response && res.status(400).json(error.response.data.details))

    return res.status(200).json(charge);
}