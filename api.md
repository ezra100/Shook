
PUT for update, POST for create, GET for get (no changes on server side)

* auth
    * login  POST
    * logout POST
    * salts POST
    * reset 
        * request POST
        * complete POST
* users
    * signup POST
    * update-details PUT
    * user-details GET
* product
    * add 
        1. POST
        2. must be logged in
    * update
        1. PUT
    * getByID
    * getLatest
        1. GET
        1. limit
        2. offset
        3. optional - username (owner of the product)
    * get product rating
        * productID
        * GET request
        * returns a number (float)
* review
    * add
        1. POST
    * remove
        1. delete HTTP method
    * update
        1. PUT
    * getByID
        1. GET
    * getLatest
        * GET
        * offset
        * limit
        * username
        * product id
        * likes array limit
* comment
    * add
    * remove
    * update (?)
    * getById
    * getByReviewID

* u2u-chat
    * sendMessage
        1. addressee
        2. POST
    * getLatestMessages
        1. GET
        2. offset
        3. limit
* room-chat
    * send message
        1. POST
        1. chatID
        2. offset
        3. limit
        4. to offline members too?
    *  getLatestMessages
        1. GET
        2. offset
        3. limit


### todo
upload images


* chats
    * personal chat
    * socket.io
* filter by creation date range
* products list
* price for product
    * allow users to report prices for the product (?)
* external entities / sellers

* search
* routing
    * products
        * id
        * seller
        * category - todo in server too
        * my feed
        * latests - from all
    * reviews
        * id
        * by user
        * my feed
        * latests - from all
    * comments
        * my comments
    * direct messages
        * all
        * user
    * chat rooms
        * chat id
        * all
        * my chats
        * chats I'm admin
        * chats I own
    * login
    * profile
* shell - header, navbar, footer
* services
    * products
    * reviews
    * 
* 2 special features
    * recaptcha
    * login with FB/Google

-----------------------
css - spacing etc. (use bootstrap?)
filtering - angular, server side (deserializing date)
-----------------------------------------------
header: products, reviews, DMessage, Chat Rooms     login/logout