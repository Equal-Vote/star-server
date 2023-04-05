import { Server, Model, Factory, trait } from "miragejs";


// NOTE: for now we'll assume that user is authorized, we can decide later how we test the failure scenarios
const authorized_voter = {'authorized_voter': true, 'has_voted': false, 'roles': [], 'permissions': []}

// vote Schema
//{
//    "db": {
//        "_collections": [
//            {
//                "name": "todos",
//                "_records": [],
//                "identityManager": {
//                    "_nextId": 1,
//                    "_ids": {}
//                }
//            }
//        ],
//        "_identityManagers": {}
//    },
//    "_registry": {
//        "todo": {
//            "foreignKeys": []
//        }
//    },
//    "_dependentAssociations": {
//        "polymorphic": []
//    },
//    "todos": {
//        "camelizedModelName": "todo"
//    },
//    "isSaving": {}
//}


// Vote Request
//{
//    "_eventListeners": {
//        "loadend": [
//            null
//        ],
//        "abort": [
//            null
//        ],
//        "load": [
//            null
//        ],
//        "progress": [
//            null
//        ],
//        "loadstart": [
//            null
//        ]
//    },
//    "readyState": 4,
//    "requestHeaders": {
//        "Accept": "application/json",
//        "Content-Type": "application/json"
//    },
//    "requestBody": "{\"ballot\":{\"ballot_id\":\"0\",\"election_id\":\"c3152107-ec74-4ccc-a5ed-40162b5ada85\",\"votes\":[{\"race_id\":\"0\",\"scores\":[{\"candidate_id\":\"0\",\"score\":5},{\"candidate_id\":\"1\",\"score\":3},{\"candidate_id\":\"2\",\"score\":0}]}],\"date_submitted\":1679970566082,\"status\":\"submitted\"}}",
//    "status": 201,
//    "statusText": "Created",
//    "upload": {
//        "_eventListeners": {
//            "loadend": [
//                null
//            ],
//            "abort": [
//                null
//            ],
//            "load": [
//                null
//            ],
//            "progress": [
//                null
//            ],
//            "loadstart": [
//                null
//            ]
//        }
//    },
//    "onloadend": null,
//    "onloadstart": null,
//    "onprogress": null,
//    "onreadystatechange": null,
//    "method": "POST",
//    "url": "/API/Election/c3152107-ec74-4ccc-a5ed-40162b5ada85/vote",
//    "async": true,
//    "responseText": "{}",
//    "response": "{}",
//    "responseXML": null,
//    "responseURL": "/API/Election/c3152107-ec74-4ccc-a5ed-40162b5ada85/vote",
//    "sendFlag": true,
//    "sendArguments": {
//        "0": "{\"ballot\":{\"ballot_id\":\"0\",\"election_id\":\"c3152107-ec74-4ccc-a5ed-40162b5ada85\",\"votes\":[{\"race_id\":\"0\",\"scores\":[{\"candidate_id\":\"0\",\"score\":5},{\"candidate_id\":\"1\",\"score\":3},{\"candidate_id\":\"2\",\"score\":0}]}],\"date_submitted\":1679970566082,\"status\":\"submitted\"}}"
//    },
//    "errorFlag": false,
//    "params": {
//        "id": "c3152107-ec74-4ccc-a5ed-40162b5ada85"
//    },
//    "queryParams": {},
//    "responseHeaders": {
//        "Content-Type": "application/json"
//    }
//}
// Quick Poll input
//       {
//     "title": "What's your favorite fruit?",
//     "election_id": "0",
//     "races": [
//         {
//             "race_id": "0",
//             "num_winners": 1,
//             "voting_method": "STAR",
//             "candidates": [
//                 {
//                     "candidate_id": "0",
//                     "candidate_name": "Banana"
//                 },
//                 {
//                     "candidate_id": "1",
//                     "candidate_name": "Strawberry"
//                 },
//                 {
//                     "candidate_id": "2",
//                     "candidate_name": "Apple"
//                 }
//             ],
//             "title": "What's your favorite fruit?"
//         }
//     ],
//     "settings": {
//         "voter_access": "open",
//         "voter_authentication": {
//             "ip_address": true
//         },
//         "ballot_updates": false,
//         "public_results": true
//     },
//     "frontend_url": "",
//     "owner_id": null,
//     "state": "open"
// }



// Quick poll output
//                 {
//                     "election_id": "c3152107-ec74-4ccc-a5ed-40162b5ada85",
//                     "title": "What's your favorite fruit?",
//                     "description": null,
//                     "frontend_url": "",
//                     "start_time": null,
//                     "end_time": null,
//                     "support_email": null,
//                     "owner_id": null,
//                     "audit_ids": null,
//                     "admin_ids": null,
//                     "credential_ids": null,
//                     "state": "open",
//                     "races": [
//                         {
//                             "race_id": "0",
//                             "num_winners": 1,
//                             "voting_method": "STAR",
//                             "candidates": [
//                                 {
//                                     "candidate_id": "0",
//                                     "candidate_name": "Banana"
//                                 },
//                                 {
//                                     "candidate_id": "1",
//                                     "candidate_name": "Strawberry"
//                                 },
//                                 {
//                                     "candidate_id": "2",
//                                     "candidate_name": "Apple"
//                                 }
//                             ],
//                             "title": "What's your favorite fruit?"
//                         }
//                     ],
//                     "settings": {
//                         "voter_access": "open",
//                         "voter_authentication": {
//                             "ip_address": true
//                         },
//                         "ballot_updates": false,
//                         "public_results": true
//                     },
//                     "auth_key": null
//                     }
//                 }


export function makeServer({ environment = "development" } = {}) {
    let server = new Server({
        environment,

        models: {
            election: Model
        },

        factories: {
            election: Factory.extend({
                "fruit-election": trait({
                    "election_id": "fruit-election",
                    "title": "What's your favorite fruit?",
                    "description": null,
                    "frontend_url": "",
                    "start_time": null,
                    "end_time": null,
                    "support_email": null,
                    "owner_id": null,
                    "audit_ids": null,
                    "admin_ids": null,
                    "credential_ids": null,
                    "state": "open",
                    "races": [
                        {
                            "race_id": "0",
                            "num_winners": 1,
                            "voting_method": "STAR",
                            "candidates": [
                                {
                                    "candidate_id": "0",
                                    "candidate_name": "Banana"
                                },
                                {
                                    "candidate_id": "1",
                                    "candidate_name": "Strawberry"
                                },
                                {
                                    "candidate_id": "2",
                                    "candidate_name": "Apple"
                                }
                            ],
                            "title": "What's your favorite fruit?"
                        }
                    ],
                    "settings": {
                        "voter_access": "open",
                        "voter_authentication": {
                            "ip_address": true
                        },
                        "ballot_updates": false,
                        "public_results": true
                    }
                })
            })
        },

        seeds(server) {
            server.create("election", "fruit-election")
        },

        routes() {
            this.namespace = "API";
            this.timing = 750;

            // for now we're testing non authenticated features, like quick poll, and voting in basic elections
            this.post('/Token', (schema, request) => {})

            this.post('/Elections', (schema, request) => {
                // TODO: add entry to mock database
                console.log(schema)
                console.log(request)
            })

            this.post('/Election/:id/vote', (schema, request) => {
            })
            // TODO: retrieve item from elections based on id
            this.get('/Election/:id', (schema, request) => {
                return {'election': schema.elections.findBy({ election_id: request.params.id }), 'voterAuth': authorized_voter }
            })
        }


        //this.get("/todos", schema => {
        //  return schema.todos.all();
        //});

        //this.patch("/todos/:id", (schema, request) => {
        //  let attrs = JSON.parse(request.requestBody).todo;

        //  return schema.todos.find(request.params.id).update(attrs);
        //});

        //this.post(
        //  "/todos",
        //  (schema, request) => {
        //    let attrs = JSON.parse(request.requestBody).todo;

        //    return schema.todos.create(attrs);
        //  },
        //  { timing: 2000 }
        //);

        //this.delete("/todos/:id", (schema, request) => {
        //  return schema.todos.find(request.params.id).destroy();
        //});
    });

    return server;
}