package com.sheehan.jobdsl

import com.google.inject.AbstractModule
import com.google.inject.Scopes
import groovy.transform.CompileStatic

@CompileStatic
class ScriptExecutionModule extends AbstractModule {

    @Override
    protected void configure() {
        bind(GistService.class).in(Scopes.SINGLETON);
        bind(ScriptExecutor).to(DslScriptExecutor)
        bind(ScriptResultRenderer)
    }
}
