# Udacity Blockchain Nanodegree - Project 3

A RESTful web-api for a private blockchain

## Getting Started

These instructions will get you up and running.

### Installation 

- `git clone` the project folder.
- Run `npm install`
- Launch the API with `npm start`

## API Endpoints

This API currently has two endpoints:

### GET /block/{blockHeight}
http://localhost:8000/block/{blockHeight}

#### Parameters
- The blockHeight of the block you wish to view

#### Response
- 200 Ok: JSON representation of the block requested:
```
{
    "hash": "29070c8b92cd61359327d2365ff90bdc99cefeb44f4dc220507dd94508690aa2",
    "height": 0,
    "body": "Genesis Block",
    "time": "1538199597",
    "previousBlockHash": ""
}
```
- 404 Not Found: If the blockHeight paramater is out of range.

### POST /block
- 'http://localhost:8000/block'


#### Parameterrs
- Accepts Content-Type 'application/json'
- The value of the body property will be added to the blockchain

#### Response
- 201 Created: JSON Representation of the new block added to the blockchain:
```
{
    "hash": "40e97a3847d7883bf1e997261d7339c62d748836c3bce228e2a263dd573ed539",
    "height": 1,
    "body": "New block",
    "time": "1538202811",
    "previousBlockHash": "62f29efbb3716ae651ce3dfc7352bcb32d2e62c0905007d31fa91a6ff1f027fe"
}
```
- 400 Bad Request: An error for any request with a missing body key.

## Built With
This project was built using [HapiJs](https://hapijs.com/).

## Authors
This project was submitted by Alex Sligar.