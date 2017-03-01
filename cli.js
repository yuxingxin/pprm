#!/usr/bin/env node
/**
 * Created by Sean on 17/2/28.
 */
var path = require('path');
var fs = require('fs');
var program = require('commander');
var npm = require('npm');
var ini = require('ini');
var echo = require('node-echo');
var extend = require('extend');
var open = require('open');
var async = require('async');
var request = require('request');
var only = require('only');

var registries = require('./registries.json');
var PKG = require('./package.json');
var PIPCONF = path.join(process.env.HOME, '.pip/pip.conf');

program.version(PKG.version);

program.command('ls')
    .description('List all the registries')
    .action(onList);

program.command('current')
    .description('Show current registry name')
    .action(showCurrent);

program.command('use <registry>')
    .description("change registry to registry")
    .action(onUse);

program.command('add <registry> <url> [home]')
    .description('Add one custom registry')
    .action(onAdd);

program.command('del <registry>')
    .description('Delete one registry')
    .action(onDel);

program.command('home <registry> [browser]')
    .description('Open the homepage of registry with optional browser')
    .action(onHome);

program.command('test [registry]')
    .description('Show response time for specific or all registries')
    .action(onTest)

program.parse(process.argv);

function onTest(registry) {
    var allRegistries = getAllRegistry();

    var toTest;

    if (registry) {
        if (!allRegistries.hasOwnProperty(registry)) {
            return;
        }
        toTest = only(allRegistries, registry);
    } else {
        toTest = allRegistries;
    }

    async.map(Object.keys(toTest), function(name, cbk) {
        var registry = toTest[name];
        var start = +new Date();
        request(registry.registry + 'pedding', function(error) {
            cbk(null, {
                name: name,
                registry: registry.registry,
                time: (+new Date() - start),
                error: error ? true : false
            });
        });
    }, function(err, results) {
        getCurrentRegistry(function(cur) {
            var msg = [''];
            results.forEach(function(result) {
                var prefix = result.registry === cur ? '* ' : '  ';
                var suffix = result.error ? 'Fetch Error' : result.time + 'ms';
                msg.push(prefix + result.name + line(result.name, 8) + suffix);
            });
            msg.push('');
            printMsg(msg);
        });
    });
}


function onHome(name, browser) {
    var allRegistries = getAllRegistry();
    var home = allRegistries[name] && allRegistries[name].home;
    if (home) {
        var args = [home];
        if (browser) args.push(browser);
        open.apply(null, args);
    }
}

function onDel(name) {
    var allRegistries = getAllRegistry();
    if(!Object.keys(allRegistries).hasOwnProperty(name)){
        printMsg([
            '', '' + name + ' is not exist', ''
        ]);
        return;
    }

    Object.keys(allRegistries).forEach(function (key) {
        if(key == name){
            delete allRegistries[name];
            var t = JSON.stringify(allRegistries);
            fs.writeFileSync('./registries.json',t);
            printMsg([
                '', '' + name + ' is deleted', ''
            ]);
            return;
        }
    })
    printMsg([
        '', '' + name + ' is not existed', ''
    ]);
}

function onAdd(name,url,home) {
    var allRegistries = getAllRegistry();
    Object.keys(allRegistries).forEach(function (key) {
        if(key == name){
            printMsg([
                '', '    name ' + name + ' has existed', ''
            ]);
            return;
        }
    })

    if (url[url.length - 1] !== '/') url += '/';
    allRegistries[name] = {};
    allRegistries[name]['home'] = home;
    allRegistries[name]['registry'] = url;
    var t = JSON.stringify(allRegistries);
    fs.writeFileSync('./registries.json',t);
    printMsg([
        '', '    add registry ' + name + ' success', ''
    ]);
}

function onUse(name) {
    var allRegistries = getAllRegistry();
    if (allRegistries.hasOwnProperty(name)) {
        var registry = allRegistries[name];
        var config = getCustomRegistry();
        config.global['index-url'] = registry.registry;
        fs.writeFileSync(PIPCONF, ini.stringify(config),{section:'global'})
        printMsg([
            '', '   Registry has been set to: ' + registry.registry, ''
        ]);
    }else{
        printMsg([
            '', '   Not find registry: ' + name, ''
        ]);
    }
}

function showCurrent() {
    getCurrentRegistry(function(cur) {
        var allRegistries = getAllRegistry();

        Object.keys(allRegistries).forEach(function(key) {
            var item = allRegistries[key];
            if(item.registry == cur){
                printMsg([key])
                return;
            }
        });
    });
}


function onList() {
    getCurrentRegistry(function(cur) {
        var info = [''];
        var allRegistries = getAllRegistry();

        Object.keys(allRegistries).forEach(function(key) {
            var item = allRegistries[key];
            var prefix = item.registry === cur ? '* ' : '  ';
            info.push(prefix + key + line(key, 8) + item.registry);
        });

        info.push('');
        printMsg(info);
    });
}


function getCurrentRegistry(cbk) {
    npm.load(function(err, conf) {
        if (err) return exit(err);
        var config = getCustomRegistry();
        cbk(config.global['index-url']);
    });
}

function getAllRegistry() {
    return extend({}, registries);
}

function getCustomRegistry() {
    return fs.existsSync(PIPCONF) ? ini.parse(fs.readFileSync(PIPCONF, 'utf-8')) : {};
}

function printMsg(infos) {
    infos.forEach(function(info) {
        console.log(info);
    });
}

function line(str, len) {
    var line = new Array(Math.max(1, len - str.length)).join('-');
    return ' ' + line + ' ';
}
