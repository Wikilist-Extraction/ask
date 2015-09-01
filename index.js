var sparqler = require("sparqler");
var sync = require("synchronize");
var Promise = require("bluebird");
var _ = require("lodash");

var triples = require("./all_entities.js");

var dbpediaSparqler = new sparqler.Sparqler("http://dbpedia.org/sparql");

var timeoutWrapper = function(callback, index) {
  if (typeof callback != "function") {
    throw new Error("callback has to be a function");
  }

  if (typeof index != "number") {
    throw new Error("index has to be a number");
  }

  return setTimeout(callback, index * 100);
};

// all new triple queries
// var queries = _(triples)
//   .map(function(triple) { return "ask { "+triple+" }"; })
//   .map(function(query) { return dbpediaSparqler.createQuery(query); })
//   .value()

// all new entity queries
var queries = _(triples)
  .map(function(uri) { return "ask { "+uri+" ?p ?o }"; })
  .map(function(query) { return dbpediaSparqler.createQuery(query); })
  .value()

var results = [];

var evaluateResults = function(results) {
  var r = _(results)
    .map(function(result) { return JSON.parse(result); })
    .map(function(result) { return result.boolean; })
    .groupBy()
    .mapValues(function(groups) { return groups.length })
    .value();

  var renamed = {
    'alreadyExistingTriples': r.true,
    'newTriples': r.false
  };
  console.log(renamed);
}
var execute = function(index) {
  if (index == queries.length) {
    evaluateResults(results)
    return;
  }

  console.log(index+"/"+queries.length);
  queries[index].execute(function(response) {
    results.push(response);
    execute(index+1);
  });
}

execute(0);
