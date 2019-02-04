// Copyright (c) 2018 Kinvey Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except
// in compliance with the License. You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software distributed under the License
// is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
// or implied. See the License for the specific language governing permissions and limitations under
// the License.

const errors = require('../../../lib/errors');
const should = require('should');

describe('process error debug messages', () => {
  it('should process an error when a string is passed', () => {
    const myError = errors.generateKinveyError('NotFound', 'This is a test error');
    myError.debug.should.eql('This is a test error');
  });

  it('should process an error when an error object is passed', () => {
    const myError = errors.generateKinveyError('NotFound', new Error('This is a test error'));
    myError.debug.should.eql('This is a test error');
    should.exist(myError.stack);
  });

  it('should process an error when nothing is passed', () => {
    const myError = errors.generateKinveyError('NotFound');
    myError.debug.should.eql({});
  });

  it('should output an error as raw json', () => {
    const myError = errors.generateKinveyError('NotFound', 'this is a test error');
    const errObj = myError.toJSON();
    errObj.should.not.be.instanceOf(Error);
    errObj.should.be.instanceOf(Object);
    errObj.error.should.eql('NotFound');
    errObj.description.should.eql('The requested entity or entites were not found in the collection');
    errObj.debug.should.eql('this is a test error');
    errObj.statusCode.should.eql(404);
    should.not.exist(errObj.stack);
  });

  return it('should output an error as raw json with a stack trace', () => {
    const myError = errors.generateKinveyError('NotFound', new Error('this is a test error'));
    const errObj = myError.toJSON();
    errObj.should.not.be.instanceOf(Error);
    errObj.should.be.instanceOf(Object);
    errObj.error.should.eql('NotFound');
    errObj.description.should.eql('The requested entity or entites were not found in the collection');
    errObj.debug.should.eql('this is a test error');
    errObj.statusCode.should.eql(404);
    should.exist(errObj.stack);
  });
});

describe('process errors of different types', () => {
  it('should process a NotFound Error', () => {
    const myError = errors.generateKinveyError('NotFound', 'Debug Text');
    myError.message.should.eql('NotFound');
    myError.description.should.eql('The requested entity or entites were not found in the collection');
    myError.debug.should.eql('Debug Text');
    myError.statusCode.should.eql(404);
  });

  it('should process a BadRequest Error', () => {
    const myError = errors.generateKinveyError('BadRequest', 'Debug Text');
    myError.message.should.eql('BadRequest');
    myError.description.should.eql('Unable to understand the request');
    myError.debug.should.eql('Debug Text');
    myError.statusCode.should.eql(400);
  });

  it('should process an InvalidCredentials Error', () => {
    const myError = errors.generateKinveyError('Unauthorized', 'Debug Text');
    myError.message.should.eql('InvalidCredentials');
    myError.description.should.eql('Invalid credentials.  Please retry your request with correct credentials.');
    myError.debug.should.eql('Debug Text');
    myError.statusCode.should.eql(401);
  });

  it('should process a Forbidden Error', () => {
    const myError = errors.generateKinveyError('Forbidden', 'Debug Text');
    myError.message.should.eql('Forbidden');
    myError.description.should.eql('The request is forbidden');
    myError.debug.should.eql('Debug Text');
    myError.statusCode.should.eql(403);
  });

  it('should process a NotAllowed Error', () => {
    const myError = errors.generateKinveyError('NotAllowed', 'Debug Text');
    myError.message.should.eql('NotAllowed');
    myError.description.should.eql('The request is not allowed');
    myError.debug.should.eql('Debug Text');
    myError.statusCode.should.eql(405);
  });

  it('should process a NotImplemented Error', () => {
    const myError = errors.generateKinveyError('NotImplemented', 'Debug Text');
    myError.message.should.eql('NotImplemented');
    myError.description.should.eql('The request invoked a method that is not implemented');
    myError.debug.should.eql('Debug Text');
    myError.statusCode.should.eql(501);
  });

  it('should process a Runtime Error', () => {
    const myError = errors.generateKinveyError('RuntimeError', 'Debug Text');
    myError.message.should.eql('DataLinkRuntimeError');
    myError.description.should.eql('The datalink had a runtime error.  See debug message for details');
    myError.debug.should.eql('Debug Text');
    myError.statusCode.should.eql(550);
  });

  return it('should return a default error if the error is unknown', () => {
    const myError = errors.generateKinveyError('SomeRandomError', 'Debug Text');
    myError.message.should.eql('DataLinkInternalError');
    myError.description.should.eql('The DataLink request experienced a problem. See debug message for details.');
    myError.debug.should.eql('Debug Text');
    myError.statusCode.should.eql(550);
  });
});

