Very basic README for now...

This is the ForgeROckDO (frodo) cli executable. This is a statically linked binary which can be cross compiled for multiple platforms (linux, MacOS, Windows etc.).

# Developing

## Prerequisites
- Install nodejs (tested on v14.9.0) and npm (included with node)

## Process
- Clone this repo
```
cd $HOME # or any other directory you wish to clone to
git clone git@github.com:rockcarver/frodo.git
```
- Build
```
cd $HOME/frodo
npm install
pkg -C GZip .
```
This will build `frodo` in local directory. There are three binaries created
```
frodo-linux
frodo-macos
frodo-win.exe
```

# Run
`frodo` is self contained, statically linked, so no dependencies should be needed. It can be run as:
```
$HOME/frodo/frodo-linux # or the platform equivalent binary
```