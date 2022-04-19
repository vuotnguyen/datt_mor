import React, {memo} from 'react';
import {Avatar} from '../../../models/image';
import AvatarRes from '../Avatar';

const AvatarUser: React.FC<{mine: boolean; avatar: string | null}> = memo(
  ({mine, avatar = ''}) => {
    return (
      <>
        {mine ? (
          <>
            <AvatarRes
              size={32}
              uri={avatar ? avatar : null}
              sizeIconLoad={13}
              styleWrapper={{marginRight: 5, marginTop: 1}}
              showIconload={false}
            />
          </>
        ) : null}
      </>
    );
  },
);
export default AvatarUser;
