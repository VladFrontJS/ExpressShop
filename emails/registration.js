const keys = require('../keys');

module.exports = function (email) {
    return {
        to: email,
        from: keys.EMAIL_FROM,
        subject: 'Account has been created',
        html: `
            <h1>Welcome in our shop</h1>
            <p>You have successfully created an account with email: ${email}</p>
            <hr />
            <a href='${keys.BASE_URL}'>Shop goods</a>
        `,
    };
};
