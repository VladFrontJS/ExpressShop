const { Schema, model } = require('mongoose');

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
    },
    name: String,
    password: {
        type: String,
        required: true,
    },
    avatarUrl: String,
    resetToken: String,
    resetTokenExp: Date,
    cart: {
        items: [
            {
                count: {
                    type: Number,
                    required: true,
                    default: 1,
                },
                courseId: {
                    type: Schema.Types.ObjectId,
                    ref: 'Course',
                    required: true,
                },
            },
        ],
    },
});

userSchema.methods.addToCart = function (course) {
    const clonedItems = [...this.cart.items];
    const idx = clonedItems.findIndex(el => {
        return el.courseId.toString() === course._id.toString();
    });

    if (idx >= 0) {
        clonedItems[idx].count++;
    } else {
        clonedItems.push({
            courseId: course._id,
            count: 1,
        });
    }
    this.cart = { items: clonedItems };
    return this.save();
};

userSchema.methods.removeFromCart = function (id) {
    let items = [...this.cart.items];
    const idx = items.findIndex(el => el.courseId.toString() === id.toString());

    if (items[idx].count === 1) {
        items = items.filter(el => el.courseId.toString() !== id.toString());
    } else {
        items[idx].count--;
    }

    this.cart = { items };
    return this.save();
};

userSchema.methods.clearCart = function () {
    this.cart = { items: [] };
    return this.save();
};

module.exports = model('User', userSchema);

// {
//     cart: { items: [] },
//     _id: new ObjectId("639ba67f5c084e3820016bb2"),
//     email: 'vlad@gmail.com',
//     name: 'vlad',
//     __v: 0
//   }
