# وسن 3.0 · ينزّل مكتبات AndroidX/Material/Kotlin إلى .deps/ بجانب هذا السكربت
# (لا Gradle — نستخدم aapt2/d8 مباشرة عبر build_apk.py)
# القائمة كاملة بما فيها التبعيات التعاقبية؛ هي نفسها المستعملة في بناء «Wasan 3.0.apk».
import os, sys, urllib.request

MAVEN = 'https://dl.google.com/dl/android/maven2'
MAVEN_CENTRAL = 'https://repo1.maven.org/maven2'
HERE = os.path.dirname(os.path.abspath(__file__))
CACHE = os.path.join(HERE, '.deps')
os.makedirs(CACHE, exist_ok=True)


def repo_for(group):
    # Google Maven لـ AndroidX/Material، وMaven Central لـ Kotlin وغيرها
    return MAVEN if group.startswith(('androidx.', 'com.google.android')) else MAVEN_CENTRAL


# (group, artifact, version, ext) — متوافقة مع compileSdk 34
DEPS = [
    ('androidx.activity', 'activity', '1.8.2', 'aar'),
    ('androidx.activity', 'activity-ktx', '1.8.2', 'aar'),
    ('androidx.annotation', 'annotation', '1.7.1', 'jar'),
    ('androidx.annotation', 'annotation-experimental', '1.3.0', 'aar'),
    ('androidx.annotation', 'annotation-jvm', '1.7.1', 'jar'),
    ('org.jetbrains', 'annotations', '23.0.0', 'jar'),
    ('androidx.appcompat', 'appcompat', '1.6.1', 'aar'),
    ('androidx.appcompat', 'appcompat-resources', '1.6.1', 'aar'),
    ('androidx.cardview', 'cardview', '1.0.0', 'aar'),
    ('androidx.collection', 'collection', '1.4.0', 'jar'),
    ('androidx.collection', 'collection-jvm', '1.4.0', 'jar'),
    ('androidx.concurrent', 'concurrent-futures', '1.1.0', 'jar'),
    ('androidx.constraintlayout', 'constraintlayout', '2.1.4', 'aar'),
    ('androidx.constraintlayout', 'constraintlayout-core', '1.0.4', 'jar'),
    ('androidx.coordinatorlayout', 'coordinatorlayout', '1.2.0', 'aar'),
    ('androidx.core', 'core', '1.12.0', 'aar'),
    ('androidx.arch.core', 'core-common', '2.2.0', 'jar'),
    ('androidx.core', 'core-ktx', '1.12.0', 'aar'),
    ('androidx.arch.core', 'core-runtime', '2.2.0', 'aar'),
    ('androidx.core', 'core-splashscreen', '1.0.1', 'aar'),
    ('androidx.cursoradapter', 'cursoradapter', '1.0.0', 'aar'),
    ('androidx.customview', 'customview', '1.1.0', 'aar'),
    ('androidx.customview', 'customview-poolingcontainer', '1.0.0', 'aar'),
    ('androidx.documentfile', 'documentfile', '1.0.0', 'aar'),
    ('androidx.drawerlayout', 'drawerlayout', '1.2.0', 'aar'),
    ('androidx.dynamicanimation', 'dynamicanimation', '1.0.0', 'aar'),
    ('androidx.emoji2', 'emoji2', '1.3.0', 'aar'),
    ('androidx.emoji2', 'emoji2-views-helper', '1.3.0', 'aar'),
    ('com.google.errorprone', 'error_prone_annotations', '2.15.0', 'jar'),
    ('androidx.fragment', 'fragment', '1.6.2', 'aar'),
    ('androidx.interpolator', 'interpolator', '1.0.0', 'aar'),
    ('org.jetbrains.kotlin', 'kotlin-stdlib', '1.9.22', 'jar'),
    ('org.jetbrains.kotlinx', 'kotlinx-coroutines-android', '1.7.3', 'jar'),
    ('org.jetbrains.kotlinx', 'kotlinx-coroutines-core-jvm', '1.7.3', 'jar'),
    ('androidx.legacy', 'legacy-support-core-utils', '1.0.0', 'aar'),
    ('androidx.lifecycle', 'lifecycle-common', '2.7.0', 'jar'),
    ('androidx.lifecycle', 'lifecycle-livedata', '2.7.0', 'aar'),
    ('androidx.lifecycle', 'lifecycle-livedata-core', '2.7.0', 'aar'),
    ('androidx.lifecycle', 'lifecycle-livedata-core-ktx', '2.7.0', 'aar'),
    ('androidx.lifecycle', 'lifecycle-process', '2.7.0', 'aar'),
    ('androidx.lifecycle', 'lifecycle-runtime', '2.7.0', 'aar'),
    ('androidx.lifecycle', 'lifecycle-runtime-ktx', '2.7.0', 'aar'),
    ('androidx.lifecycle', 'lifecycle-viewmodel', '2.7.0', 'aar'),
    ('androidx.lifecycle', 'lifecycle-viewmodel-ktx', '2.7.0', 'aar'),
    ('androidx.lifecycle', 'lifecycle-viewmodel-savedstate', '2.7.0', 'aar'),
    ('com.google.guava', 'listenablefuture', '1.0', 'jar'),
    ('androidx.loader', 'loader', '1.1.0', 'aar'),
    ('androidx.localbroadcastmanager', 'localbroadcastmanager', '1.0.0', 'aar'),
    ('com.google.android.material', 'material', '1.11.0', 'aar'),
    ('androidx.print', 'print', '1.0.0', 'aar'),
    ('androidx.profileinstaller', 'profileinstaller', '1.3.1', 'aar'),
    ('androidx.recyclerview', 'recyclerview', '1.3.2', 'aar'),
    ('androidx.resourceinspection', 'resourceinspection-annotation', '1.0.1', 'jar'),
    ('androidx.savedstate', 'savedstate', '1.2.1', 'aar'),
    ('androidx.savedstate', 'savedstate-ktx', '1.2.1', 'aar'),
    ('androidx.startup', 'startup-runtime', '1.1.1', 'aar'),
    ('androidx.swiperefreshlayout', 'swiperefreshlayout', '1.1.0', 'aar'),
    ('androidx.tracing', 'tracing', '1.2.0', 'aar'),
    ('androidx.transition', 'transition', '1.4.1', 'aar'),
    ('androidx.vectordrawable', 'vectordrawable', '1.1.0', 'aar'),
    ('androidx.vectordrawable', 'vectordrawable-animated', '1.1.0', 'aar'),
    ('androidx.versionedparcelable', 'versionedparcelable', '1.1.1', 'aar'),
    ('androidx.viewpager', 'viewpager', '1.0.0', 'aar'),
    ('androidx.viewpager2', 'viewpager2', '1.0.0', 'aar'),
]


def fetch(url, dest):
    if os.path.exists(dest) and os.path.getsize(dest) > 0:
        return True
    try:
        print('  GET', url.split('maven2/')[-1])
        urllib.request.urlretrieve(url, dest + '.part')
        os.replace(dest + '.part', dest)
        return True
    except Exception as e:
        print('  ✗', e)
        if os.path.exists(dest + '.part'):
            os.remove(dest + '.part')
        return False


def main():
    ok = True
    for group, art, ver, ext in DEPS:
        url = f'{repo_for(group)}/{group.replace(".", "/")}/{art}/{ver}/{art}-{ver}.{ext}'
        if not fetch(url, os.path.join(CACHE, f'{art}-{ver}.{ext}')):
            print(f'✗ فشل: {group}:{art}:{ver}')
            ok = False
    print('ALL_OK' if ok else 'SOME_FAILED', '·', len(DEPS), 'مكتبة في', CACHE)
    return 0 if ok else 1


if __name__ == '__main__':
    sys.exit(main())
