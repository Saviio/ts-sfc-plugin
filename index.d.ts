import React from 'react'

declare module 'react' {
  namespace JSX {
    interface IntrinsicAttributes extends React.Attributes {
      sfc?: boolean
    }
  }
}
