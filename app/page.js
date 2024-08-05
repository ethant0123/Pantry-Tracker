'use client'
import { useState, useEffect } from 'react'
import { firestore } from '@/firebase'
import { Box, Modal, Stack, TextField, Typography, Button, Switch, MenuItem, Select, InputLabel, FormControl, Popover } from '@mui/material'
import { collection, getDocs, query, deleteDoc, doc, setDoc, getDoc } from 'firebase/firestore'

export default function Home() {
  const [inventory, setInventory] = useState([])
  const [open, setOpen] = useState(false)
  const [itemName, setItemName] = useState('')
  const [itemQuantity, setItemQuantity] = useState(1)
  const [darkMode, setDarkMode] = useState(false)
  const [selectedItem, setSelectedItem] = useState('')
  const [anchorEl, setAnchorEl] = useState(null) // Anchor for the Popover
  const openPopover = Boolean(anchorEl)
  const id = openPopover ? 'simple-popover' : undefined

  const updateInventory = async () => {
    const snapshot = query(collection(firestore, 'Inventory'))
    const docs = await getDocs(snapshot)
    const inventoryList = []
    docs.forEach((doc) => {
      inventoryList.push({
        name: doc.id,
        ...doc.data(),
      })
    })
    setInventory(inventoryList)
  }

  const addItem = async (item, quantity) => {
    const docRef = doc(collection(firestore, 'Inventory'), item)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      const existingQuantity = docSnap.data().quantity
      await setDoc(docRef, { quantity: existingQuantity + quantity })
    } else {
      await setDoc(docRef, { quantity })
    }

    await updateInventory()
  }

  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, 'Inventory'), item)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      const { quantity } = docSnap.data()
      if (quantity === 1) {
        await deleteDoc(docRef)
      } else {
        await setDoc(docRef, { quantity: quantity - 1 })
      }
    }

    await updateInventory()
  }

  const deleteItem = async () => {
    if (!selectedItem) {
      console.log('No item selected for deletion')
      return; // Return if no item is selected
    }
    try {
      const docRef = doc(collection(firestore, 'Inventory'), selectedItem)
      await deleteDoc(docRef)
      console.log(`Item ${selectedItem} deleted successfully`)
      await updateInventory()
      setSelectedItem('') // Clear the selected item after deletion
    } catch (error) {
      console.error('Error deleting item: ', error)
    }
    setAnchorEl(null) // Close the popover after deletion
  }

  useEffect(() => {
    updateInventory()
  }, [])

  const handleOpen = () => setOpen(true)
  const handleClose = () => {
    setOpen(false)
    setItemName('')
    setItemQuantity(1) // Reset quantity to 1
  }

  const handleThemeToggle = () => {
    setDarkMode(!darkMode)
  }

  return (
    <Box
      width={'100vw'}
      height='100vh'
      display={'flex'}
      flexDirection='column'
      justifyContent={'center'}
      alignItems={'center'}
      gap={2}
      sx={{
        backgroundColor: darkMode ? '#333' : '#FFF',
        color: darkMode ? '#FFF' : '#333',
      }}
    >
      <Box position="absolute" top={20} right={20}>
        <Typography variant="body1" component="span" sx={{ fontSize: '1.5rem' }}>
          Dark Mode
        </Typography>
        <Switch checked={darkMode} onChange={handleThemeToggle} />
      </Box>
      <Modal open={open} onClose={handleClose}>
        <Box
          position={'absolute'}
          top='50%'
          left='50%'
          width={400}
          bgcolor={darkMode ? '#444' : 'white'}
          border={'2px solid #000'}
          boxShadow={24}
          p={4}
          display={'flex'}
          flexDirection={'column'}
          gap={3}
          sx={{
            transform: 'translate(-50%, -50%)',
            color: darkMode ? '#FFF' : '#333',
          }}
        >
          <Typography variant='h5' sx={{ fontSize: '1.5rem' }}>Add Item</Typography>
          <Stack width={'100%'} direction={'column'} spacing={2}>
            <TextField
              variant='outlined'
              fullWidth
              label="Item Name"
              value={itemName}
              onChange={(e) => {
                setItemName(e.target.value)
              }}
              InputProps={{
                style: { color: darkMode ? '#FFF' : '#333', fontSize: '1.2rem' },
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: darkMode ? '#FFF' : '#333',
                  },
                },
                '& .MuiInputLabel-root': {
                  fontSize: '1.2rem',
                },
              }}
            />
            <TextField
              variant='outlined'
              fullWidth
              label="Quantity"
              type="number"
              value={itemQuantity}
              onChange={(e) => {
                setItemQuantity(Number(e.target.value))
              }}
              InputProps={{
                style: { color: darkMode ? '#FFF' : '#333', fontSize: '1.2rem' },
                inputProps: { min: 1 },
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: darkMode ? '#FFF' : '#333',
                  },
                },
                '& .MuiInputLabel-root': {
                  fontSize: '1.2rem',
                },
              }}
            />
            <Button
              variant='outlined'
              onClick={() => {
                addItem(itemName, itemQuantity)
                handleClose()
              }}
              sx={{
                fontSize: '1.2rem',
                color: darkMode ? '#FFF' : '#333',
                borderColor: darkMode ? '#FFF' : '#333',
              }}
            >
              Add
            </Button>
          </Stack>
        </Box>
      </Modal>
      <Box display="flex" gap={2}>
        <Button
          variant='contained'
          onClick={() => {
            handleOpen()
          }}
          sx={{
            fontSize: '1.2rem',
            backgroundColor: darkMode ? '#555' : '#1976d2',
            color: darkMode ? '#FFF' : '#FFF',
          }}
        >
          Add New Item
        </Button>
        <Button
          variant='contained'
          onClick={(event) => setAnchorEl(event.currentTarget)} // Open Popover on click
          sx={{
            fontSize: '1.2rem',
            backgroundColor: darkMode ? '#444' : '#C62828',
            // backgroundColor: darkMode ? '#C62828' : '#D32F2F', 
            color: '#FFF',
          }}
        >
          Delete Item
        </Button>
        <Popover
          id={id}
          open={openPopover}
          anchorEl={anchorEl}
          onClose={() => setAnchorEl(null)}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
        >
          <Box p={2}>
            <FormControl fullWidth>
              <InputLabel>Select Item</InputLabel>
              <Select
                value={selectedItem}
                onChange={(e) => setSelectedItem(e.target.value)}
                sx={{ fontSize: '1.2rem' }}
              >
                {inventory.map(({ name }) => (
                  <MenuItem key={name} value={name}>
                    {name.charAt(0).toUpperCase() + name.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant='contained'
              onClick={() => {
                deleteItem()
              }}
              sx={{
                fontSize: '1.2rem',
                backgroundColor: darkMode ? '#C62828' : '#D32F2F', // Dark mode red color
                color: '#FFF',
                marginTop: 2,
              }}
              disabled={!selectedItem} // Disable the button if no item is selected
            >
              Confirm Delete
            </Button>
          </Box>
        </Popover>
      </Box>
      <Box border={`1px solid ${darkMode ? '#FFF' : '#333'}`} sx={{ overflow: 'hidden' }}>
        <Box width={800} height={100} bgcolor={darkMode ? '#555' : '#ADD8E6'} display={'flex'} alignItems='center' justifyContent={'center'}>
          <Typography variant='h3' color={darkMode ? '#FFF' : '#333'} sx={{ fontSize: '3rem' }}>
            Inventory Items
          </Typography>
        </Box>
        <Box
          width={800}
          height={50}
          bgcolor={darkMode ? '#666' : '#E0E0E0'}
          display={'flex'}
          alignItems='center'
          justifyContent={'space-between'}
          paddingX={5}
          sx={{
            borderBottom: `1px solid ${darkMode ? '#FFF' : '#333'}`,
          }}
        >
          <Box flex={2} display='flex' alignItems='center' justifyContent='flex-start'>
            <Typography variant='h6' color={darkMode ? '#FFF' : '#333'} sx={{ fontSize: '1.5rem', textAlign: 'center' }}>
              Item Name
            </Typography>
          </Box>
          <Box flex={6} display='flex' alignItems='center' justifyContent='center'>
            <Typography variant='h6' color={darkMode ? '#FFF' : '#333'} sx={{ fontSize: '1.5rem', textAlign: 'center' }}>
              Quantity
            </Typography>
          </Box>
          <Box flex={2} display='flex' alignItems='center' justifyContent='flex-start'>
            <Typography variant='h6' color={darkMode ? '#FFF' : '#333'} sx={{ fontSize: '1.5rem', textAlign: 'center' }}>
              Function
            </Typography>
          </Box>
        </Box>
        <Stack width='800px' maxHeight='300px' spacing={0} overflow={'auto'}>
          {inventory.map(({ name, quantity }, index) => (
            <Box
              key={name}
              width='100%'
              minHeight='150px'
              display='flex'
              alignItems='center'
              justifyContent="space-between"
              bgcolor={darkMode ? '#666' : '#FFF'}
              padding={5}
              sx={{
                borderBottom: index === inventory.length - 1 ? 'none' : `1px solid ${darkMode ? '#FFF' : '#333'}`,
              }}
            >
              <Box flex={2} display='flex' alignItems='center' justifyContent='flex-start' pr={2}>
                <Typography variant='h6' color={darkMode ? '#FFF' : '#333'} sx={{ fontSize: '2rem', textAlign: 'center' }}>
                  {name.charAt(0).toUpperCase() + name.slice(1)}
                </Typography>
              </Box>
              <Box flex={3.3} display='flex' alignItems='center' justifyContent='center'>
                <Typography variant='h6' color={darkMode ? '#FFF' : '#333'} sx={{ fontSize: '2rem', textAlign: 'center' }}>
                  {quantity}
                </Typography>
              </Box>
              <Box flex={1.5} display='flex' alignItems='center' justifyContent='center' pr={2}>
                <Stack direction={'row'} alignItems='center' spacing={2}>
                  <Button
                    variant='contained'
                    onClick={() => {
                      addItem(name, 1)
                    }}
                    sx={{
                      fontSize: '1rem',
                      backgroundColor: darkMode ? '#777' : '#1976d2',
                      color: darkMode ? '#FFF' : '#FFF',
                    }}
                  >
                    Add
                  </Button>
                  <Button
                    variant='contained'
                    onClick={() => {
                      removeItem(name)
                    }}
                    sx={{
                      fontSize: '1rem',
                      backgroundColor: darkMode ? '#777' : '#1976d2',
                      color: darkMode ? '#FFF': '#FFF',
                    }}
                  >
                    Remove
                  </Button>
                </Stack>
              </Box>
            </Box>
          ))}
        </Stack>
      </Box>
    </Box>
  )
}
