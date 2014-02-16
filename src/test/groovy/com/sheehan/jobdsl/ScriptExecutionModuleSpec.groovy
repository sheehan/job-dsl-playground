package com.sheehan.jobdsl

import org.junit.Rule
import org.junit.rules.TemporaryFolder
import ratpack.groovy.test.TestHttpClient
import ratpack.groovy.test.TestHttpClients
import ratpack.groovy.test.embed.ClosureBackedEmbeddedApplication
import spock.lang.AutoCleanup
import spock.lang.Ignore
import spock.lang.Specification

/**
 * An example of functionally testing a module in isolation, using {@link ratpack.test.embed.EmbeddedApplication}
 */
@Ignore
class ScriptExecutionModuleSpec extends Specification {

    @Rule
    TemporaryFolder tmp = new TemporaryFolder()

    @AutoCleanup
    ClosureBackedEmbeddedApplication app

    TestHttpClient client

    def setup() {
        app = new ClosureBackedEmbeddedApplication(tmp.root)
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
                    render executor.execute("println 'foo'")
                }
            }
        }

        then:
        client.get().body.jsonPath().getString("outputText") == "foo\n"
    }

}
