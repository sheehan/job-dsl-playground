package com.sheehan.jobdsl

import groovy.transform.CompileStatic
import ratpack.groovy.handling.GroovyContext
import ratpack.groovy.render.GroovyRendererSupport

import static groovy.json.JsonOutput.toJson

@CompileStatic
class ScriptResultRenderer extends GroovyRendererSupport<ScriptResult> {

    @Override
    void render(GroovyContext context, ScriptResult result) {
        context.byContent {
            json {
                context.render toJson(result)
            }
        }
    }
}
