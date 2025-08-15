/*
Copyright © 2015 Infrared5, Inc. All rights reserved.

The accompanying code comprising examples for use solely in conjunction with Red5 Pro (the "Example Code")
is  licensed  to  you  by  Infrared5  Inc.  in  consideration  of  your  agreement  to  the  following
license terms  and  conditions.  Access,  use,  modification,  or  redistribution  of  the  accompanying
code  constitutes your acceptance of the following license terms and conditions.

Permission is hereby granted, free of charge, to you to use the Example Code and associated documentation
files (collectively, the "Software") without restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit
persons to whom the Software is furnished to do so, subject to the following conditions:

The Software shall be used solely in conjunction with Red5 Pro. Red5 Pro is licensed under a separate end
user  license  agreement  (the  "EULA"),  which  must  be  executed  with  Infrared5,  Inc.
An  example  of  the EULA can be found on our website at: https://account.red5.net/assets/LICENSE.txt.

The above copyright notice and this license shall be included in all copies or portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,  INCLUDING  BUT
NOT  LIMITED  TO  THE  WARRANTIES  OF  MERCHANTABILITY, FITNESS  FOR  A  PARTICULAR  PURPOSE  AND
NONINFRINGEMENT.   IN  NO  EVENT  SHALL INFRARED5, INC. BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN  AN  ACTION  OF  CONTRACT,  TORT  OR  OTHERWISE,  ARISING  FROM,  OUT  OF  OR  IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

const SOURCE_WIDTH = 1920
const SOURCE_HEIGHT = 1080
const NodeTypes = {
  VideoNode: 'VideoSourceNode',
  AudioNode: 'AudioSourceNode'
}

const ROOT_VIDEO_NODE = {
  nodes: [
    {
      red: 0,
      green: 0,
      blue: 0,
      alpha: 1,
      node: 'SolidColorNode'
    }
  ],
  node: 'CompositorNode'
}

const ROOT_AUDIO_NODE = {
  nodes: [],
  node: 'SumNode'
}

const getResolution = columns => {
  const width = SOURCE_WIDTH / columns
  const height = (width * 9) / 16
  return { width, height }
}

const generateManifestFromColumns = (manifest, columns, rows) => {
  const { width, height } = getResolution(columns)
  const { rootVideoNode, rootAudioNode } = manifest
  const { nodes } = rootVideoNode
  const videoNodes = nodes.filter(node => node.node === NodeTypes.VideoNode)
  const updatedVideoNodes = videoNodes.map((node, index) => {
    const muted = index > columns * rows - 1
    const x = index % columns
    const y = Math.floor(index / columns)
    return {
      ...node,
      destX: muted ? 0 : x * width,
      destY: muted ? 0 : y * height,
      destWidth: muted ? 0 : width,
      destHeight: muted ? 0 : height
    }
  })
  const updatedRootVideoNode = {
    ...ROOT_VIDEO_NODE,
    // Clear.
    nodes: [
      {
        red: 0,
        green: 0,
        blue: 0,
        alpha: 1,
        node: 'SolidColorNode'
      },
      ...updatedVideoNodes
    ]
  }
  return { rootVideoNode: updatedRootVideoNode, rootAudioNode }
}

/**
 * MixerService is responisible for integrating with the BrewMixer API.
 */
class MixerService {
  endpoint = null
  authentication = null
  jwt = null
  manifest = null

  /**
   * Constructor.
   * @param {string} endpoint
   */
  constructor(endpoint, authentication = null) {
    this.endpoint = endpoint
    this.authentication = authentication
  }

  /**
   * Constructs a video listing from the response of service.
   * @param {[object]} responseData
   * @returns [object]
   */
  responseDataToVideoListing(responseData) {
    const videoRoot = responseData.filter(type => type.rootVideoNode)
    const videoNodes = videoRoot ? videoRoot[0].rootVideoNode : null
    const videos =
      videoNodes && videoNodes.nodes
        ? videoNodes.nodes.filter(node => node.node === 'VideoSourceNode')
        : []
    return videos
  }

  async authenticate() {
    const { endpoint, username, password } = this.authentication
    const token = 'Basic ' + btoa(username + ':' + password)
    const response = await fetch(endpoint, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token
      }
    })
    const result = await response.json()
    this.jwt = result.token
    return this.jwt
  }

  /**
   * Request to update the grid layout of the mixed stream and return list of videos in grid.
   * @param {number} columns
   * @returns [object]
   */
  async updateGrid(columns) {
    let eventJSON = null
    try {
      const count = parseInt(columns, 10)
      let grid = generateManifestFromColumns(this.manifest, count, count)
      let token = this.jwt
      let headers = {
        'Content-Type': 'application/json'
      }
      if (this.authentication && !token) {
        token = await this.authenticate()
      }
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
      const eventResponse = await fetch(this.endpoint, {
        method: 'PUT',
        headers,
        body: JSON.stringify([grid])
      })
      if (eventResponse.status === 200) {
        eventJSON = [grid]
        this.manifest = grid
      } else {
        console.error(`Failed to update grid: ${eventURL}`)
        throw new Error('Failed update grid.')
      }
    } catch (error) {
      console.error(error)
      alert('Failed to update grid.')
      // throw error;
    }
    if (eventJSON) {
      return this.responseDataToVideoListing(eventJSON)
    }
    return []
  }

  /**
   * Request to get the data related to the event.
   * @returns [object]
   */
  async getEvent() {
    let eventJSON = null
    try {
      let token = this.jwt
      let headers = {
        'Content-Type': 'application/json'
      }
      if (this.authentication && !token) {
        token = await this.authenticate()
      }
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
      const eventResponse = await fetch(this.endpoint, {
        method: 'GET',
        headers
      })
      if (eventResponse.status === 200) {
        eventJSON = await eventResponse.json()
      } else {
        console.error(`Failed to fetch event at: ${this.endpoint}`)
        throw new Error('Failed to fetch event.')
      }
    } catch (error) {
      console.error(error)
      // throw new Error(`Failed to load events: ${error.message}.`);
    }

    if (eventJSON) {
      this.manifest = eventJSON.length > 0 ? eventJSON[0] : eventJSON
      return this.responseDataToVideoListing(eventJSON)
    }
    return []
  }
}

export default MixerService
