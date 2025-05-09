import React, { useState, useRef, useEffect } from 'react'
import {
    TextField,
    Typography,
    Backdrop,
    CircularProgress,
    IconButton,
    Box,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Autocomplete,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import { AmpSDKProps } from '../../lib/models/treeItemData'
import { getProductImage } from '../../lib/product';


export default function ProductOrCategoryOrExtUrlSelector({ampSDK} : AmpSDKProps) {
    const [loading, setLoading] = useState(false)
    const selectedBlank = {
        id: '',
        name: '',
        idType: '',
        image: '',
    }
    const [selected, setSelected] = useState(ampSDK.getValue() || selectedBlank)
    const idInput = useRef<HTMLInputElement>(null)
    const defaultHeight = 240

    const searchProductById = async () => {
        if (!idInput.current?.value) return
        setLoading(true)
        ampSDK.clearValue()
        const product = await ampSDK.commerceApi.getProduct({
            id: idInput.current.value
        })
        if (product) {
            const next = {
                id: product.id,
                name: product.name,
                idType: 'product',
                image: getProductImage(product),
            }
            setSelected(next)
            ampSDK.setValue(next)
        }
        setLoading(false)
    }

    const handleIdKeydown = (event: React.KeyboardEvent<HTMLElement>) => {
        if (event.key === 'Enter') {
            searchProductById()
        } else if (event.key === 'Escape') {
            setSelected({...selectedBlank, idType: "product"})
            ampSDK.clearValue()
        }
    }

    useEffect(() => {
        ampSDK.setHeight(defaultHeight)
    }, [selected.idType]);

    return (
        <div>
            <Backdrop
                sx={{
                    color: '#77f',
                    backgroundColor: 'rgba(200,200,200,0.6)',
                    zIndex: (theme) => theme.zIndex.drawer + 1
                }}
                open={loading}
            >
                <CircularProgress color='inherit' />
            </Backdrop>
            
            <FormControl size="small" sx={{ minWidth: 180, mt: 2, mb: 2 }}>
                <InputLabel id="type-select-label">Select Type</InputLabel>
                <Select
                    labelId="type-select-label"
                    id="type-select"
                    value={selected.idType}
                    label="Select Type"
                    onChange={e => setSelected({...selectedBlank, idType: e.target.value})}
                >
                    <MenuItem value="product">Product</MenuItem>
                    <MenuItem value="category">Category</MenuItem>
                    <MenuItem value="extUrl">External URL</MenuItem>
                </Select>
            </FormControl>

            {selected.idType === 'product' && (
                <>
                    <Box sx={{ display: 'flex' }}>
                        <TextField
                            inputRef={idInput}
                            size='small'
                            sx={{ flex: 1, "& label":{color: '#597681'},"& fieldset": { borderColor: '#b4c0f2', borderRadius: '.5rem' }, "& fieldset:hover": { borderColor: '#b4bef2' } }}
                            label='Product or Style ID'
                            color='primary'
                            variant='outlined'
                            inputProps={{
                                'aria-label': 'product or style id (escape key to clear)'
                            }}
                            onKeyDown={handleIdKeydown}
                            onChange={e => setSelected({...selected, id: e.target.value})}
                            value={selected.id}
                        />
                        <IconButton
                            type='button'
                            onClick={searchProductById}
                            sx={{ ml: '5px', p: '8px',color:'#597684' }}
                            aria-label='search'
                        >
                            <SearchIcon />
                        </IconButton>
                    </Box>
                    <Typography
                        mt={1}
                        ml={3}
                        variant='h3'
                        fontSize={'12px'}
                        fontWeight={'normal'}
                        color={'#597684'}
                    >
                        Name: {selected?.name ? selected?.name +  '✅' : ''}
                    </Typography>
                </>
            )}

            {selected.idType === 'category' && (
                <>
                     <Autocomplete
                        disablePortal
                        options={ampSDK.getCategories()}
                        getOptionLabel={(option) => option.name || ''}
                        sx={{ width: '100%', marginTop: '6px', "& label":{color: '#597681'},"& fieldset": { borderColor: '#b4c0f2', borderRadius: '.5rem' }, "& fieldset:hover": { borderColor: '#b4bef2' } }}
                        value={selected?.id ? selected : null}
                        // defaultValue={ampSDK.getValue()}
                        onChange={(_, val) => {
                            if(val !== null){
                                // ampSDK.setValue({...val, name: val.name.replace(/\(.*\)\s/, '')})
                                const next = {
                                    ...selected,
                                    id: val.id,
                                    name: val.name,
                                }
                                setSelected(next)
                                ampSDK.setValue(next)
                            }else{
                                ampSDK.clearValue()
                                setSelected({...selectedBlank, idType: "category"})
                            }
                        }}
                        onClose={() => {
                            ampSDK.setHeight(defaultHeight)
                        }}
                        onOpen={() => {
                            ampSDK.setHeight(440)
                        }}
                        renderInput={(params) => <TextField {...params} label="Category" />}
                    />
                </>
            )}

            {selected.idType === 'extUrl' && (
                <>
                    <Box sx={{ display: 'flex', mb: 2 }}>
                        <TextField
                            size='small'
                            sx={{ flex: 1, "& label":{color: '#597681'},"& fieldset": { borderColor: '#b4c0f2', borderRadius: '.5rem' }, "& fieldset:hover": { borderColor: '#b4bef2' } }}
                            label='External URL'
                            color='primary'
                            variant='outlined'
                            inputProps={{
                                'aria-label': 'product or style id (escape key to clear)'
                            }}
                            onChange={e => {
                                const next = {...selected, id: e.target.value}
                                setSelected(next)
                                ampSDK.setValue(next)
                            }}
                            value={selected.id}
                        />
                    </Box>
                    <Box sx={{ display: 'flex' }}>
                        <TextField
                            size='small'
                            sx={{ flex: 1, "& label":{color: '#597681'},"& fieldset": { borderColor: '#b4c0f2', borderRadius: '.5rem' }, "& fieldset:hover": { borderColor: '#b4bef2' } }}
                            label='Image URL'
                            color='primary'
                            variant='outlined'
                            inputProps={{
                                'aria-label': 'product or style id (escape key to clear)'
                            }}
                            onChange={e => {
                                const next = {...selected, image: e.target.value}
                                setSelected(next)
                                ampSDK.setValue(next)
                            }}
                            value={selected.image}
                        />
                    </Box>
                </>
            )}
        </div>
    )
}