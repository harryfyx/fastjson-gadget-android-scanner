import time
import sys
import json

import frida

DEVICE = "emulator-5556"
PROCESS = 14042


clsNameSet = set()
clsMethods = {}


def recordClsName(clsName):
	clsNameSet.add(clsName)


def recordMethods(msg):
	message = json.loads(msg)
	clsMethods[message['class-name']] = message['methods']


def saveClsName():
	filename = f'loaded-classes-enumerate-{int(time.time())}.txt'
	with open(filename, 'w+') as fp:
		fp.write('\n'.join(list(clsNameSet)))


def saveMethods():
	filename = f'target-class-methods-{int(time.time())}.txt'
	with open(filename, 'w+') as fp:
		fp.write(json.dumps(clsMethods))


if __name__ == '__main__':

	if sys.argv[1] == 'cls':
		with open('save_loaded_classes.js') as fp:
			save_loaded_classes_srcipt = fp.read()

		session = frida.get_device(id=DEVICE).attach(PROCESS)

		script = session.create_script(save_loaded_classes_srcipt)

		def on_message(message, data):
			if message['type'] == 'send':
				# print("[*] {0}".format(message['payload']))
				recordClsName(message['payload'])
			else:
				pass
				# print(message)

		script.on('message', on_message)
		script.load()
		time.sleep(5)
		saveClsName()

	elif sys.argv[1] == 'script':
		with open('find_target_classes.js') as fp:
			script_template = fp.read()

		with open(sys.argv[2]) as fp:
			clsList = fp.read().strip().split('\n')

		session = frida.get_device(id=DEVICE).attach(PROCESS)
		print('[*] got session')

		# clsList = ['com.android.org.conscrypt.TrustedCertificateStore']  # temp
		_script = script_template.replace('REPLACE-THIS-FROM-PY', json.dumps(clsList))

		script = session.create_script(_script)

		def on_message(message, data):
			if message['type'] == 'send':
				# print("[*] {0}".format(message['payload']))
				recordMethods(message['payload'])
			else:
				pass
				# print(message)
				
		script.on('message', on_message)
		script.load()
		time.sleep(5)
		saveMethods()

	else:
		raise
