package com.sheehan.jobdsl

import spock.lang.Specification

class DslScriptExecutorSpec extends Specification {

    DslScriptExecutor executor = new DslScriptExecutor()

    def 'captures result'() {
        when:
        ScriptResult result = executor.execute 'job("jobName") { description "testing" }'

        then:
        result.results.size() == 1
        result.results[0].name == 'jobName'
        result.results[0].xml.startsWith '<project>'
    }

    def 'captures view'() {
        when:
        ScriptResult result = executor.execute 'listView("viewName") { description "testing" }'

        then:
        result.results.size() == 1
        result.results[0].name == 'viewName'
        result.results[0].xml.startsWith '<hudson.model.ListView>'
    }

    def 'captures errors'() {
        when:
        ScriptResult result = executor.execute 'throw new Exception("bang")'

        then:
        result.stacktrace.contains 'java.lang.Exception'
        result.stacktrace.contains 'bang'
    }
}
