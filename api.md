
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
    * getByUser
        1. GET
        1. offset
        2. limit
* review
    * add
        1. POST
    * remove
        1. delete HTTP method
    * update
        1. PUT
    * delete
        1. DELTE
    * getByID
        1. GET
    * getLatest
        GET,offset,limit
    * getByUser
        GET, offset, limit

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

* product
* review
* chats