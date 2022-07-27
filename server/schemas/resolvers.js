const { AuthenticationError } = require("apollo-server-express");
const { User } = require("../models");
const { auth } = require("../utils/auth");


const resolvers = {
    Query: {
        users: async (parent) => {
            try {
                return User.find({});
            } catch (error) {
                console.log(error);
            }
        },

        me: async (parent, args, context) => {
            return User.findOne({_id: context.user._id});
            // Error message?
        },
    },

    Mutation: {
        addUser: async (parent, {username, email, password}) => {
            try {
                const user = await User.create({ username, email, password});
                const token = auth(user);
                return {token, user}
            } catch (error) {
                console.log(error)
                // 
            }
        },

        login: async (parent, {email, password}) => {
            const user = await User.findOne({ email: email });

            if (!user) {
                console.log("No profile found with this email address");
            }

            const checkPassword = await user.isCorrectPassword(password);

            if (!checkPassword) {
                console.log("Incorrect Password");
            }

            const token = auth(user);
            return { token, user };
        },



        saveBook: async (parent, {newBook}, context) => {

            if(!context.user) {
                console.log("Not logged in!")
            }

            try {
                const bookUpdate = await User.findOneAndUpdate(
                    {_id: context.user._id},
                    {$push: {savedBooks: {...newBook}}},
                    {new: true}
                );
                if (!bookUpdate) {
                    console.log("Could not add User");
                }
                return  bookUpdate;
            } catch (error) {
                console.log(error);
            }
        },

        removeBook: async (parent, {bookId}, context) => {

            if (!context.user) {
                console.log("Not Logged in");
            }

            try {
                const bookUpdate = await User.findOneAndUpdate(
                    {_id: context.user._id},
                    {$pull: { savedBooks: {bookId: bookId}}},
                    {new:true}
                );

                if (!bookUpdate) {
                    console.log("Could not add User")
                }
                
                return bookUpdate;
            } catch (error) {
                console.log(error);
            }
        },
    },
};

module.exports = resolvers;