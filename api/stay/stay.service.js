import { dbService } from '../../services/db.service.js'
import { logger } from '../../services/logger.service.js'
import { utilService } from '../../services/util.service.js'
import mongodb from 'mongodb'
const { ObjectId } = mongodb

const PAGE_SIZE = 3


async function query(filterBy = { txt: '', price: 0, destination: '', guests: 0 }) {
    try {
        const criteria = {
            // vendor: { $regex: filterBy.txt, $options: 'i' }
        }
        const collection = await dbService.getCollection('stay')
        var stayCursor = await collection.find(criteria)

        // if (filterBy.pageIdx !== undefined) {
        //     stayCursor.skip(filterBy.pageIdx * PAGE_SIZE).limit(PAGE_SIZE)     
        // }

        const stays = stayCursor.toArray()
        return stays
    } catch (err) {
        logger.error('cannot find stays', err)
        throw err
    }
}

function _buildCriteria(filterBy) {
    const { price, destination, guests, hostId } = filterBy

    const byHostId = { $regex: hostId }
    return byHostId
    // const byGuests = { capacity: { $gt: guests } }
}

async function getById(stayId) {
    try {
        const collection = await dbService.getCollection('stay')
        const stay = collection.findOne({ _id: ObjectId(stayId) })
        return stay
    } catch (err) {
        logger.error(`while finding stay ${stayId}`, err)
        throw err
    }
}

async function remove(stayId) {
    try {
        const collection = await dbService.getCollection('stay')
        await collection.deleteOne({ _id: ObjectId(stayId) })
        return stayId
    } catch (err) {
        logger.error(`cannot remove stay ${stayId}`, err)
        throw err
    }
}

async function add(stay) {
    try {
        const collection = await dbService.getCollection('stay')
        await collection.insertOne(stay)
        return stay
    } catch (err) {
        logger.error('cannot insert stay', err)
        throw err
    }
}

async function update(stay) {
    console.log('update in stay.service, stay:', stay._id);
    try {
        const stayToSave = {
            name: stay.name,
            type: stay.type,
            imgUrls: stay.imgUrls,
            price: stay.price,
            summary: stay.summary,
            capacity: stay.capacity,
            amenities: stay.amenities,
            bathrooms: stay.bathrooms,
            bedrooms: stay.bedrooms,
            roomType: stay.roomType,
            host: stay.host,
            loc: stay.loc,
            reviews: stay.reviews,
            likedByUsers: stay.likedByUsers
        }
        const collection = await dbService.getCollection('stay')
        await collection.updateOne({ _id: ObjectId(stay._id) }, { $set: stayToSave })
        return stay
    }
    catch (err) {
        logger.error(`cannot update stay ${stay._id}`, err)
        throw err
    }
}


async function addStayMsg(stayId, msg) {
    try {
        msg.id = utilService.makeId()
        const collection = await dbService.getCollection('stay')
        await collection.updateOne({ _id: ObjectId(stayId) }, { $push: { msgs: msg } })
        return msg
    } catch (err) {
        logger.error(`cannot add stay msg ${stayId}`, err)
        throw err
    }
}

async function removeStayMsg(stayId, msgId) {
    try {
        const collection = await dbService.getCollection('stay')
        await collection.updateOne({ _id: ObjectId(stayId) }, { $pull: { msgs: { id: msgId } } })
        return msgId
    } catch (err) {
        logger.error(`cannot add stay msg ${stayId}`, err)
        throw err
    }
}

export const stayService = {
    remove,
    query,
    getById,
    add,
    update,
    addStayMsg,
    removeStayMsg
}
