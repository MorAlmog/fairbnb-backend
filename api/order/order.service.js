import {dbService} from '../../services/db.service.js'
import {logger} from '../../services/logger.service.js'
import {utilService} from '../../services/util.service.js'
import mongodb from 'mongodb'
const {ObjectId} = mongodb

const PAGE_SIZE = 3


async function query(filterBy={userType: 'host'}) {
    try {
        filterBy.userId = loggedinUser._id
        const criteria = _buildCriteria(filterBy)
        const collection = await dbService.getCollection('order')
        var orderCursor = await collection.find(criteria)

        // if (filterBy.pageIdx !== undefined) {
        //     orderCursor.skip(filterBy.pageIdx * PAGE_SIZE).limit(PAGE_SIZE)     
        // }

        const orders = orderCursor.toArray()
        return orders
    } catch (err) {
        logger.error('cannot find orders', err)
        throw err
    }
}

function _buildCriteria(filterBy) {
    const byId = { $regex: filterBy.userId, $options: 'i' }
    // const byUserType = { $regex: filterBy.userType, $options: 'i' }
    if (filterBy.userType === 'host') {
        const criteria = { 'host._id':byId }
    }
    else if (filterBy.userType === 'buyer') {
        const criteria = { 'buyer._id':byId }
    }
    else throw new Error('Error: filterBy.userType is not properly defined')

    return criteria
}

async function getById(orderId) {
    try {
        const collection = await dbService.getCollection('order')
        const order = collection.findOne({ _id: ObjectId(orderId) })
        return order
    } catch (err) {
        logger.error(`while finding order ${orderId}`, err)
        throw err
    }
}

async function remove(orderId) {
    try {
        const collection = await dbService.getCollection('order')
        await collection.deleteOne({ _id: ObjectId(orderId) })
        return orderId
    } catch (err) {
        logger.error(`cannot remove order ${orderId}`, err)
        throw err
    }
}

async function add(order) {
    try {
        const collection = await dbService.getCollection('order')
        await collection.insertOne(order)
        return order
    } catch (err) {
        logger.error('cannot insert order', err)
        throw err
    }
}

async function update(order) {
    try {
        const orderToSave = {
            createdAt: order.createdAt,
            buyer: order.buyer,
            totalPrice: order.totalPrice,
            startDate: order.startDate,
            endDate: order.endDate,
            guests: order.guests,
            stay: order.stay,
            msgs: order.msgs,
            host: order.host,
            status: order.status
        }
        const collection = await dbService.getCollection('order')
        await collection.updateOne({ _id: ObjectId(order._id) }, { $set: orderToSave })
        return order
    } catch (err) {
        logger.error(`cannot update order ${orderId}`, err)
        throw err
    }
}

async function addOrderMsg(orderId, msg) {
    try {
        msg.id = utilService.makeId()
        const collection = await dbService.getCollection('order')
        await collection.updateOne({ _id: ObjectId(orderId) }, { $push: { msgs: msg } })
        return msg
    } catch (err) {
        logger.error(`cannot add order msg ${orderId}`, err)
        throw err
    }
}

async function removeOrderMsg(orderId, msgId) {
    try {
        const collection = await dbService.getCollection('order')
        await collection.updateOne({ _id: ObjectId(orderId) }, { $pull: { msgs: {id: msgId} } })
        return msgId
    } catch (err) {
        logger.error(`cannot add order msg ${orderId}`, err)
        throw err
    }
}

export const orderService = {
    remove,
    query,
    getById,
    add,
    update,
    addOrderMsg,
    removeOrderMsg
}
