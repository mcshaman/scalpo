import express from 'express'
import * as packetModel from './models/packets.js'

const app = express()
app.use(express.json())

app.get('/packet', async (req, res) => {
	try {
		const packets = await packetModel.findAll()
		res.status(200).json(packets)
	} catch (err) {
		res.status(500).json({ message: err.message })
	}
})

app.post('/packet', async (req, res) => {
	try {
		const { market_id, status } = req.body
		await packetModel.create(market_id, status)
		res.status(200).json({ message: 'packet created' })
	} catch (err) {
		res.status(500).json({ message: err.message })
	}
})

app.get('/packet/:id', async (req, res) => {
	try {
		const packet = await packetModel.findOne(req.params.id)
		if (packet != null) {
			res.status(200).json(packet)
		} else {
			res.status(404).json({ message: 'packet does not exist' })
		}
	} catch (err) {
		res.status(500).json({ message: err.message })
	}
})

app.put('/packet/:id', async (req, res) => {
	try {
		const { market_id, status } = req.body
		await packetModel.update(req.params.id, market_id, status)
		res.status(200).json({ message: 'packet updated' })
	} catch (err) {
		res.status(500).json({ message: err.message })
	}
})

app.listen(process.env.NODE_DOCKER_PORT, () => {
	console.log(`application running on port ${process.env.NODE_DOCKER_PORT}`)
})
