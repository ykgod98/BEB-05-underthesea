import { useState } from 'react'
import { ethers } from "ethers"
import { Row, Form, Button } from 'react-bootstrap'
const { NFTStorage, Blob, toAsyncIterable } = require('nft.storage');

const client = new NFTStorage({ token : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDAxOEUxOTg5ZDlBMTIxYzQ1MEMzQkYwMUU1NUFkMjEwZDIwN0QyMTIiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTY2MDYxNTU0NDE4MiwibmFtZSI6InVuZGVydGhlc2VhIn0.vtYc8a4HKnzG7sdE0xkxi-Ns2maF6qvq47t3NkXY5dA'});

const Create = ({ marketplace, nft }) => {
  const [image, setImage] = useState('')
  const [price, setPrice] = useState(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const uploadToIPFS = async (event) => {
    event.preventDefault()
    const file = event.target.files[0]
    if (typeof file !== 'undefined') {
      try {
        const result = await store(file)
        console.log(result)

        setImage(`https://ipfs.io/ipfs/${result}`)
      } catch (error){
        console.log("ipfs image upload error: ", error)
      }
    }
  }
  const store = async (data) => {
    const fileCid = await client.storeBlob(new Blob([data]));
    const fileUrl = "https://ipfs.io/ipfs/" + fileCid;
    console.log(fileUrl);
    return fileCid;
  }
  const createNFT = async () => {
    if (!image || !price || !name || !description) return
    try{
      const metadata = new Blob([JSON.stringify({image, price, name, description})])
      const result = await client.storeBlob(metadata);
      mintThenList(result)
    } catch(error) {
      console.log("ipfs uri upload error: ", error)
    }
  }
  const mintThenList = async (result) => {
    const uri = "https://ipfs.io/ipfs/" + result;
    // mint nft 
    await(await nft.mint(uri)).wait()
    // get tokenId of new nft 
    const id = await nft.tokenCount()
    // approve marketplace to spend nft
    await(await nft.setApprovalForAll(marketplace.address, true)).wait()
    // add nft to marketplace
    const listingPrice = ethers.utils.parseEther(price.toString())
    await(await marketplace.makeItem(nft.address, id, listingPrice)).wait()
  }
  return (
    <div className="container-fluid mt-5">
      <div className="row">
        <main role="main" className="col-lg-12 mx-auto" style={{ maxWidth: '1000px' }}>
          <div className="content mx-auto">
            <Row className="g-4">
              <Form.Control
                type="file"
                required
                name="file"
                onChange={uploadToIPFS}
              />
              <Form.Control onChange={(e) => setName(e.target.value)} size="lg" required type="text" placeholder="Name" />
              <Form.Control onChange={(e) => setDescription(e.target.value)} size="lg" required as="textarea" placeholder="Description" />
              <Form.Control onChange={(e) => setPrice(e.target.value)} size="lg" required type="number" placeholder="Price in ETH" />
              <div className="d-grid px-0">
                <Button onClick={createNFT} variant="primary" size="lg">
                  Create & List NFT!
                </Button>
              </div>
            </Row>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Create