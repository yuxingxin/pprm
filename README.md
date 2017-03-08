### pprm -- Pypi registry manager

[![NPM version][npm-image]][npm-url]

`pprm` can help you switch between different registries easily,now include:

 * [pypi](https://pypi.python.org/simple/)
 * [douban](https://pypi.doubanio.com/simple/)
 * [ali](http://mirrors.aliyun.com/pypi/simple/)
 * [tsinghua](https://pypi.tuna.tsinghua.edu.cn/simple/)
 * [ustc](https://mirrors.ustc.edu.cn/pypi/web/simple/)


### Install

```
$  npm install -g pprm
```

### Example
```
$ prm ls

  pypi --- https://pypi.python.org/simple/
* douban - https://pypi.doubanio.com/simple/
  ali ---- http://mirrors.aliyun.com/pypi/simple/
  tsinghua  https://pypi.tuna.tsinghua.edu.cn/simple/
  ustc --- https://mirrors.ustc.edu.cn/pypi/web/simple/

```

```
$ prm use ali

Registry has been set to: http://mirrors.aliyun.com/pypi/simple/

```

### Usage

```
Usage: prm [options] [command]


Commands:

ls                           List all the registries
current                      Show current registry name
use <registry>               change registry to registry
add <registry> <url> [home]  Add one custom registry
del <registry>               Delete one registry
home <registry> [browser]    Open the homepage of registry with optional browser
test [registry]              Show response time for specific or all registries

Options:

-h, --help     output usage information
-V, --version  output the version number

```


### LICENSE
MIT

[npm-image]: https://img.shields.io/badge/pprm-v1.0.4-blue.svg
[npm-url]: https://www.npmjs.com/package/pprm