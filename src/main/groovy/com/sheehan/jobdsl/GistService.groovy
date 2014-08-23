package com.sheehan.jobdsl

import com.google.inject.Inject
import org.kohsuke.github.*
import ratpack.launch.LaunchConfig

class GistService {

    final String login
    final String apikey

    @Inject
    GistService(LaunchConfig launchConfig) {
        login = launchConfig.getOther('github.login', System.getenv('GITHUB_LOGIN'))
        apikey = launchConfig.getOther('github.apikey', System.getenv('GITHUB_APIKEY'))
    }

    String getGroovyText(String gistId) {
        String text
        try {
            GitHub github = GitHub.connect(login, apikey)
            GHGist gist = github.getGist(gistId)

            if (gist) {
                List<GHGistFile> files = gist.files.values().toList()
                GHGistFile groovyFile = files.find { it.fileName.endsWith '.groovy' }

                if (groovyFile) {
                    text = groovyFile.content
                }
            }
        } catch (e) {
            e.printStackTrace()
        }

        text
    }

}
