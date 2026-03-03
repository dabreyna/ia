Tengo una interfaz de chat que me permite escribir mensajes y recibir respuestas.
la UI se encuentra en el archivo index.html y el código de la interfaz se encuentra en el archivo chat.js.

Quiero que construyas un workflow en mi instancia de n8n. Este workflow debe tener un nodo que reciba mensajes de chat y un nodo que envíe mensajes a un canal de chat.

El nodo que recibe mensajes de chat debe tener el siguiente formato:

{
    "message": "Mensaje del usuario",
    "sessionId": "ID de la sesión",
    "timestamp": "Fecha y hora del mensaje",
    "userInput": "Mensaje del usuario sin formato",
    "isExistingCustomer": "Booleano que indica si el usuario es cliente o no"
}

El workflow debe funcionar de la siguiente manera:

1. recibir mensajes de chat el primer mensaje que recibe contiene la variable "isExistingCustomer" con el valor "false" o "true" dependiendo de si el usuario es cliente o no.
2. si el usuario es cliente ("isExistingCustomer"==true) debera proceder a un siguiente agente que funcione como recepcionista el cual debe analizar el mensaje y determinar:
    a) si el el usuario esta interesado en comprar o solicita informacion de los terrenos que tenemos en venta (precio, ubicacion, tamaño, formas de pago, financiamiento,etc.). Si el mensaje del usuario entra en esta categoría debera hacer uso de una herramienta llamada 'AGENTE VENTAS' el cual es un agente IA cuyo prompt lo debes crear a partir de la informacion que se encuentra en el archivo llamado 'AgenteVentas.md'. este contiene toda la información necesaria para que puedas crear el prompt del agente y pueda responder al usuario.
    b) si el usuario quiere agendar una visita a un terreno, o agendar una cita con un agente, debera hacer uso de una herramienta llamada 'AGENTE CITAS' el cual es un agente IA cuyo prompt lo debes crear a partir de la informacion que se encuentra en el archivo llamado 'AgenteCitas.md'. este contiene toda la información necesaria para que puedas crear el prompt del agente y pueda responder al usuario.
    c) si el usuario quiere reportar un problema con sus pagos o desea hablar con un agente de cobranza, debera hacer uso de una herramienta llamada 'AGENTE COBRANZA' el cual es un agente IA cuyo prompt lo debes crear a partir de la informacion que se encuentra en el archivo llamado 'AgenteCobranza.md'. este contiene toda la información necesaria para que puedas crear el prompt del agente y pueda responder al usuario.
    d) si el usuario quiere reportar un problema con su terreno o servicios, debera hacer uso de una herramienta llamada 'ATENCION CLIENTES' el cual es un agente IA cuyo prompt lo debes crear a partir de la informacion que se encuentra en el archivo llamado 'AgenteAtencionClientes.md'. este contiene toda la información necesaria para que puedas crear el prompt del agente y pueda responder al usuario.
3. si el usuario no es cliente ("isExistingCustomer"==false) debera proceder a un siguiente agente que funcione como recepcionista el cual debe analizar el mensaje y determinar:
    a) si el el usuario esta interesado en comprar o solicita informacion de los terrenos que tenemos en venta (precio, ubicacion, tamaño, formas de pago, financiamiento,etc.). Si el mensaje del usuario entra en esta categoría debera hacer uso de una herramienta llamada 'AGENTE VENTAS' el cual es un agente IA cuyo prompt lo debes crear a partir de la informacion que se encuentra en el archivo llamado 'AgenteVentas.md'. este contiene toda la información necesaria para que puedas crear el prompt del agente y pueda responder al usuario.
    b) si el usuario quiere agendar una visita a un terreno, o agendar una cita con un agente, debera hacer uso de una herramienta llamada 'AGENTE CITAS' el cual es un agente IA cuyo prompt lo debes crear a partir de la informacion que se encuentra en el archivo llamado 'AgenteCitas.md'. este contiene toda la información necesaria para que puedas crear el prompt del agente y pueda responder al usuario.