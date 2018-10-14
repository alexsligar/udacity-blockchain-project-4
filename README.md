# Udacity Blockchain Nanodegree - Project 4

A RESTful web-api for registering stars

## Getting Started

These instructions will get you up and running.

### Installation 

- `git clone` the project folder.
- Run `npm install`
- Launch the API with `npm start`

## API Endpoints

This API currently has the following endpoints:

## Validation Endpoints
The validation process requires users to provide a wallet address and complete the process of signing and registering a star before the validationWindow expires (5 minutes).

### POST /requestValidation
http://localhost:8000/requestValidation

#### Parameters
- address: A valid wallet address for signing a message

#### Response
-201 Created: JSON response with the message to sign:
```
{
  "address": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ",
  "requestTimeStamp": "1532296090",
  "message": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ:1532296090:starRegistry",
  "validationWindow": 300
}
```
-400 Bad Request: If an invalid wallet address is provided

### POST /message-signature/validate
http://localhost:8000/message-signature/validate

#### Parameters
- address: The wallet address that corresponds to the message to be signed
- signature: A valid signature for the message requested from requestValidation

#### Response
-200 Ok: JSON confirmation that the signature was valid and a star can be added:
```
{
  "registerStar": true,
  "status": {
    "address": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ",
    "requestTimeStamp": "1532296090",
    "message": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ:1532296090:starRegistry",
    "validationWindow": 193,
    "messageSignature": "valid"
  }
}
```
-400 Bad Request: An error due to the signature being invalid or expiration of the validationWindow

## Star Registry Endpoints

### POST /block
-'http://localhost:8000/block'


#### Parameterrs
- Accepts Content-Type 'application/json'
- address: A valid wallet address which has a signed message from requestValidation
- star: 
    -ra: right ascension of the star
    -dec: declination of the star
    -mag: optional magnitude of the star
    -con: optional constellation of the star
    -story: Ascii string limited to 500 characters

#### Response
- 201 Created: JSON Representation of the new star registered to the blockchain with hex encoded star story:
```
{
  "hash": "a59e9e399bc17c2db32a7a87379a8012f2c8e08dd661d7c0a6a4845d4f3ffb9f",
  "height": 1,
  "body": {
    "address": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ",
    "star": {
      "ra": "16h 29m 1.0s",
      "dec": "-26° 29' 24.9",
      "story": "466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f"
    }
  },
  "time": "1532296234",
  "previousBlockHash": "49cce61ec3e6ae664514d5fa5722d86069cf981318fc303750ce66032d0acff3"
}
```
- 400 Bad Request: An error for any request missing required parameters or with a missing/invalid message validation

### GET /block/{blockHeight}
http://localhost:8000/block/{blockHeight}

#### Parameters
- The blockHeight of the block you wish to view

#### Response
- 200 Ok: JSON representation of the block requested:
```
{
  "hash": "a59e9e399bc17c2db32a7a87379a8012f2c8e08dd661d7c0a6a4845d4f3ffb9f",
  "height": 1,
  "body": {
    "address": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ",
    "star": {
      "ra": "16h 29m 1.0s",
      "dec": "-26° 29' 24.9",
      "story": "466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f",
      "storyDecoded": "Found star using https://www.google.com/sky/"
    }
  },
  "time": "1532296234",
  "previousBlockHash": "49cce61ec3e6ae664514d5fa5722d86069cf981318fc303750ce66032d0acff3"
}
```
- 404 Not Found: If the blockHeight paramater is out of range.

### GET /stars/hash:[hash]
http://localhost:8000/stars/hash:[hash]

#### Parameters
-hash: The hash of the star block you wish to retrieve

#### Response
200 Ok: JSON representation of the block registered with the blockchain
```
{
  "hash": "a59e9e399bc17c2db32a7a87379a8012f2c8e08dd661d7c0a6a4845d4f3ffb9f",
  "height": 1,
  "body": {
    "address": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ",
    "star": {
      "ra": "16h 29m 1.0s",
      "dec": "-26° 29' 24.9",
      "story": "466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f",
      "storyDecoded": "Found star using https://www.google.com/sky/"
    }
  },
  "time": "1532296234",
  "previousBlockHash": "49cce61ec3e6ae664514d5fa5722d86069cf981318fc303750ce66032d0acff3"
}
```
404 Not Found: If the hash provided doesn't correspond to any registered blocks in the blockchain

### GET /stars/address:[address]
http://localhost:8000/stars/address:[address]

#### Parameters
-address: A valid wallet address to retrieve all stars registered under

#### Response
200 Ok: An array of the blocks corresponding to the address provided:
```
[
  {
    "hash": "a59e9e399bc17c2db32a7a87379a8012f2c8e08dd661d7c0a6a4845d4f3ffb9f",
    "height": 1,
    "body": {
      "address": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ",
      "star": {
        "ra": "16h 29m 1.0s",
        "dec": "-26° 29' 24.9",
        "story": "466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f",
        "storyDecoded": "Found star using https://www.google.com/sky/"
      }
    },
    "time": "1532296234",
    "previousBlockHash": "49cce61ec3e6ae664514d5fa5722d86069cf981318fc303750ce66032d0acff3"
  },
  {
    "hash": "6ef99fc533b9725bf194c18bdf79065d64a971fa41b25f098ff4dff29ee531d0",
    "height": 2,
    "body": {
      "address": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ",
      "star": {
        "ra": "17h 22m 13.1s",
        "dec": "-27° 14' 8.2",
        "story": "466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f",
        "storyDecoded": "Found star using https://www.google.com/sky/"
      }
    },
    "time": "1532330848",
    "previousBlockHash": "a59e9e399bc17c2db32a7a87379a8012f2c8e08dd661d7c0a6a4845d4f3ffb9f"
  }
]
```
404 Not Found: If the wallet address was invalid

## Built With
This project was built using [HapiJs](https://hapijs.com/).

## Authors
This project was submitted by Alex Sligar.