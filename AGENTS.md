# Project rules
- Load remote fonts through document head links and Editorial's serif through the installed font package so the CSS compiler never resolves remote imports.
- Keep source exports portable with asset binaries and backend source; exclude repository metadata, dependencies, generated outputs and private credentials because they are not portable application source.