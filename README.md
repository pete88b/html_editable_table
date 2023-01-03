# HTML Editable Table
> Show how we can make editable tables with HTML, CSS and JavaScript.


# Quick project overview

This is a work in progress but for now ...

This project contains lots of plain HTML, CSS and JavaScript examples of how we can work with editable HTML tables. 
We also have a [FastAPI](https://fastapi.tiangolo.com/) app
- to make it easy to serve the static examples locally
- show how we can make calls to a back-end API

## Live demos

- [via github pages](https://pete88b.github.io/html_editable_table/)
    - Everything except the API call demo works via github pages

# Running locally

## Install anaconda

[miniconda](https://docs.conda.io/en/latest/miniconda.html) is great (o:

## Clone from github

change directory to where you would like the repo to live on your machine

```
git clone https://github.com/pete88b/html_editable_table.git
```

## Create the conda environment

```
cd html_editable_table
conda env create -f environment.yaml
```

## Start the FastAPI test server

windows

```
SET X_API_KEYS=['test']
uvicorn app:app --reload
```

linux

```
export X_API_KEYS=['test']
uvicorn app:app --reload
```

## Then ...

Hit [the index page](http://127.0.0.1:8000/docs/index.html) and try it out. Feel free to edit the project files- FastAPI reloads pretty fast so you should just need to reload your browser to see changes.

Note: API docs are available at [the docs page](http://127.0.0.1:8000/docs)

# The python app

`app.py` creates the app by calling `create_app` from the `main` module.
