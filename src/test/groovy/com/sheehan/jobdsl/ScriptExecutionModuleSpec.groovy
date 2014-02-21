package com.sheehan.jobdsl

import org.junit.Rule
import org.junit.rules.TemporaryFolder
import ratpack.groovy.test.TestHttpClient
import ratpack.groovy.test.TestHttpClients
import ratpack.groovy.test.embed.ClosureBackedEmbeddedApplication
import ratpack.test.embed.PathBaseDirBuilder
import spock.lang.AutoCleanup
import spock.lang.Ignore
import spock.lang.Specification

class ScriptExecutionModuleSpec extends Specification {

    @Rule
    TemporaryFolder tmp = new TemporaryFolder()

    @AutoCleanup
    ClosureBackedEmbeddedApplication app

    TestHttpClient client

    def setup() {
        app = new ClosureBackedEmbeddedApplication(new PathBaseDirBuilder(tmp.root))
        client = TestHttpClients.testHttpClient(app)
    }

    def "script module provides executor and renderer"() {
        when:
        app.with {
            modules {
                register new ScriptExecutionModule()
            }
            handlers {
                get { ScriptExecutor executor ->
                    render executor.execute('job { name "test" }')
                }
            }
        }

        then:
        with (client.get().body.jsonPath().getList('results')[0]) {
            xml.startsWith '<project>'
            name == 'test'
        }
    }

}
