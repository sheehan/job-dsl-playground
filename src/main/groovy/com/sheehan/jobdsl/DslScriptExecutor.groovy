package com.sheehan.jobdsl

import javaposse.jobdsl.dsl.ConfigFileType
import javaposse.jobdsl.dsl.DslScriptLoader
import javaposse.jobdsl.dsl.JobManagement
import javaposse.jobdsl.dsl.JobParent
import javaposse.jobdsl.dsl.ScriptRequest
import org.codehaus.groovy.control.MultipleCompilationErrorsException
import org.codehaus.groovy.runtime.StackTraceUtils

class DslScriptExecutor implements ScriptExecutor {

    ScriptResult execute(String scriptText) {

        def stackTrace = new StringWriter()
        def errWriter = new PrintWriter(stackTrace)

        def emcEvents = []
        def listener = { MetaClassRegistryChangeEvent event ->
            emcEvents << event
        } as MetaClassRegistryChangeEventListener

        GroovySystem.metaClassRegistry.addMetaClassRegistryChangeEventListener listener

        ScriptResult scriptResult = new ScriptResult()
        try {
            CustomSecurityManager.restrictThread()
            JobManagement jm = [
                getOutputStream: { System.out },
                getParameters: { [:] },
                queueJob: {},
                requireMinimumPluginVersion: { String pluginShortName, String version -> },
                getPluginVersion: { String pluginShortName -> null },
                logDeprecationWarning: {},
                getCredentialsId: { String credentialsDescription -> null },
                getConfigFileId: { ConfigFileType type, String name -> UUID.randomUUID().toString() },
                createOrUpdateConfig: { String name, String xml, Boolean ignoreExisting -> true }
            ] as JobManagement

            ScriptRequest scriptRequest = new ScriptRequest(null, scriptText, new File('.').toURI().toURL())
            JobParent jobParent = DslScriptLoader.runDslEngineForParent(scriptRequest, jm)

            scriptResult.results = jobParent.referencedJobs.toList().collect { [name: it.getName(), xml: it.xml] }
            scriptResult.results += jobParent.referencedViews.toList().collect { [name: it.getName(), xml: it.xml] }
        } catch (MultipleCompilationErrorsException e) {
            stackTrace.append(e.message - 'startup failed, Script1.groovy: ')
        } catch (Throwable t) {
            StackTraceUtils.deepSanitize t
            t.printStackTrace errWriter
        } finally {
            GroovySystem.metaClassRegistry.removeMetaClassRegistryChangeEventListener listener
            emcEvents.each { MetaClassRegistryChangeEvent event ->
                GroovySystem.metaClassRegistry.removeMetaClass event.classToUpdate
            }
            CustomSecurityManager.unrestrictThread()
        }

        scriptResult.stacktrace = stackTrace.toString()
        scriptResult
    }
}
