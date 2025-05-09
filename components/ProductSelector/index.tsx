import React, { useState, useRef } from 'react'
import {
    TextField,
    Typography,
    Backdrop,
    CircularProgress,
    IconButton,
    Box,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import { AmpSDKProps } from '../../lib/models/treeItemData'
import { getProductImage, getProductVariant, Product } from '../../lib/product';

type ProductData = {
    id: string
    name: string
    image: string
    variant: string
}

export default function ProductSelector({ampSDK} : AmpSDKProps) {
    const [id, setId] = useState('')
    const [loading, setLoading] = useState(false)
    const [selectedProduct, setSelectedProduct] = useState<ProductData>(ampSDK.getValue())
    const keywordInput = useRef<HTMLInputElement>(null)


    const searchById = async () => {
        if (!keywordInput.current?.value) return
        setLoading(true)
        setSelectedProduct(null)
        try {
            const product = await ampSDK.commerceApi.getProduct({
                id: keywordInput.current.value
            })
            if (product) {
                const next = {
                    id: product.id,
                    name: product.name,
                    image: getProductImage(product),
                    variant: getProductVariant(product)?.sku
                }
                setSelectedProduct(next)
                ampSDK.setValue(next)
            } else {
                setSelectedProduct(null)
                ampSDK.clearValue()
            }
        } catch (e) {
            setSelectedProduct(null)
            ampSDK.clearValue()
        }
        setLoading(false)
    }

    const handleIdKeydown = (event: React.KeyboardEvent<HTMLElement>) => {
        if (event.key === 'Enter') {
            searchById()
        } else if (event.key === 'Escape') {
            setId('')
            setSelectedProduct(null)
            ampSDK.clearValue()
        }
    }

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
            <Box sx={{ display: 'flex', mt: 2 }}>
                <TextField
                    inputRef={keywordInput}
                    size='small'
                    sx={{ flex: 1, "& label":{color: '#597681'},"& fieldset": { borderColor: '#b4c0f2', borderRadius: '.5rem' }, "& fieldset:hover": { borderColor: '#b4bef2' } }}
                    label='Product or Style ID'
                    color='primary'
                    variant='outlined'
                    inputProps={{
                        'aria-label': 'product or style id (escape key to clear)'
                    }}
                    onKeyDown={handleIdKeydown}
                    onChange={e => setId(e.target.value)}
                    value={id}
                />
                <IconButton
                    type='button'
                    onClick={searchById}
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
                Name: {selectedProduct?.name ? selectedProduct?.name +  '✅' : ''}
            </Typography>
        </div>
    )
}
