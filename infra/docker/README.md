# Local service foundation

Core Docker services are intentionally absent from issue #8. PostgreSQL, queue, object
storage, mail catcher, and the optional VRSCTEST profile belong to issue #9. The TypeScript
workspace builds and tests without this directory providing any running service.
