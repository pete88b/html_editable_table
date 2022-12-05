# HTML Editable Table
> Show how we can make editable table with HTML, CSS and JavaScript.


## Quick project overview

### Live demos

- [Fixed size table](https://bl.ocks.org/pete88b/a2044cf563b5e92f63ca800b108e7893)
    - HTML editable table with export to JSON

TODO: explain why we have a python app as well ...

- `10_main.ipynb`
    - TODO
- `00_core.ipynb`
    - TODO

# Running locally

Note: See conda setup below

The easiest way to get started is to run the app from the command line.

```
SET X_API_KEYS=['test']
conda activate html_editable_table
cd devopsgit\html_editable_table
uvicorn app:app --reload
```

Hit [the docs page](http://127.0.0.1:8000/docs) and try it out

# Deployment

TODO: explain how to deploy to python anywhere

See https://fastapi.tiangolo.com/deployment/server-workers/ if you're interested in startup command options.

# Developers

## Conda set-up

`conda env create -f environment.yaml`
