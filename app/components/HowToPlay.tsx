import { useState } from 'react'
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '~/components/Dialog'
import { Button } from '~/components/Button'
import { ActionType, CardType } from '~/types'
import classNames from 'classnames'
import { Sprite } from './Sprite'
import { ActionIcon } from './ActionIcon'

// Reusable table components
const TableContainer: React.FC<React.PropsWithChildren> = ({ children }) => (
  <div className='overflow-x-auto'>
    <table className='min-w-full border-collapse'>{children}</table>
  </div>
)

const TableHead: React.FC<React.PropsWithChildren> = ({ children }) => (
  <thead className='bg-nord-4 border-b border-nord-3'>{children}</thead>
)

const TableBody: React.FC<React.PropsWithChildren> = ({ children }) => <tbody className='bg-nord-5'>{children}</tbody>

const TableRow: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ children, className = '' }) => (
  <tr className={className}>{children}</tr>
)

const TableHeader: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ children, className }) => (
  <th className={classNames('text-base text-nord-0 px-4 py-2 text-left whitespace-nowrap', className)}>{children}</th>
)

const TableCell: React.FC<React.PropsWithChildren<{ highlight?: boolean; className?: string }>> = ({
  children,
  highlight = false,
  className
}) => (
  <td
    className={classNames(
      'text-sm text-nord-1 px-4 py-2',
      {
        'font-bold uppercase': highlight,
        'text-nord-3': children === '--'
      },
      className
    )}
  >
    {children}
  </td>
)

const CardTag: React.FC<{ type: CardType }> = ({ type }) => (
  <div className='inline-flex items-center gap-1 tracking-wide font-normal font-robotica'>
    <Sprite id='card' size='sm' color='nord-10' />
    <span className='translate-y-[0.125em]'>{type}</span>
  </div>
)

// Game actions data
const actionData = [
  {
    type: ActionType.INCOME,
    effect: 'Take 1 coin from the treasury',
    requiredCharacter: '--',
    blockableBy: '--'
  },
  {
    type: ActionType.FOREIGN_AID,
    effect: 'Take 2 coins from the treasury',
    requiredCharacter: '--',
    blockableBy: <CardTag type={CardType.DUKE} />
  },
  {
    type: ActionType.TAX,
    effect: 'Take 3 coins from the treasury',
    requiredCharacter: <CardTag type={CardType.DUKE} />,
    blockableBy: '--'
  },
  {
    type: ActionType.STEAL,
    effect: 'Steal 2 coins from another player',
    requiredCharacter: <CardTag type={CardType.CAPTAIN} />,
    blockableBy: (
      <div className='flex flex-wrap gap-1'>
        <CardTag type={CardType.AMBASSADOR} />
        <CardTag type={CardType.CAPTAIN} />
      </div>
    )
  },
  {
    type: ActionType.ASSASSINATE,
    effect: 'Force another player to lose influence',
    requiredCharacter: <CardTag type={CardType.ASSASSIN} />,
    blockableBy: <CardTag type={CardType.CONTESSA} />,
    coinCost: 3
  },
  {
    type: ActionType.EXCHANGE,
    effect: 'Exchange cards with the Court deck',
    requiredCharacter: <CardTag type={CardType.AMBASSADOR} />,
    blockableBy: '--'
  },
  {
    type: ActionType.COUP,
    effect: 'Force another player to lose influence',
    requiredCharacter: '--',
    blockableBy: '--',
    coinCost: 7
  }
]

export const HowToPlay = () => {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size='sm' sprite='question' variant='primary' />
      </DialogTrigger>
      <DialogContent>
        <DialogTitle className='text-xl font-bold text-center mb-4'>How to Play Coup</DialogTitle>

        <div className='mb-6'>
          <p className='mb-4'>
            In Coup, your goal is to be the last player with influence remaining. On your turn, you must take one of the
            following actions:
          </p>
        </div>

        <TableContainer>
          <TableHead>
            <TableRow>
              <TableHeader className='pl-6'>Action</TableHeader>
              <TableHeader>Effect</TableHeader>
              <TableHeader>Required Character</TableHeader>
              <TableHeader>Block Character</TableHeader>
              <TableHeader>Coin Cost</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {actionData.map((action, i) => (
              <TableRow key={i} className='border-b border-nord-3'>
                <TableCell
                  highlight
                  className={classNames('pl-6', {
                    'pb-3': i === actionData.length - 1
                  })}
                >
                  <div className='flex items-center gap-1'>
                    <ActionIcon action={action.type} size='sm' color='nord-1' bgColor='nord-5' />
                    <span>{action.type.replace('_', ' ')}</span>
                  </div>
                </TableCell>
                <TableCell
                  className={classNames('text-xs italic min-w-48', {
                    'pb-3': i === actionData.length - 1
                  })}
                >
                  {action.effect}
                </TableCell>
                <TableCell
                  className={classNames({
                    'pb-3': i === actionData.length - 1
                  })}
                >
                  {action.requiredCharacter}
                </TableCell>
                <TableCell
                  className={classNames({
                    'pb-3': i === actionData.length - 1
                  })}
                >
                  {action.blockableBy}
                </TableCell>
                <TableCell
                  className={classNames({
                    'pb-3': i === actionData.length - 1
                  })}
                >
                  {action.coinCost ? (
                    <div className='flex items-center gap-1 text-xs text-nord-11'>
                      <span className='translate-y-[0.125em] font-robotica'>-{action.coinCost}</span>
                      <Sprite id='chip' size='sm' color='nord-11' />
                    </div>
                  ) : null}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </TableContainer>

        <div className='mt-6'>
          <h3 className='font-bold mb-2'>Additional Rules:</h3>
          <ul className='list-disc list-inside pl-4 space-y-2'>
            <li>
              If you have 10 or more coins, you <span className='font-bold'>must</span> perform a Coup action.
            </li>
            <li>
              When another player makes an action, you can challenge their character claim if they claim to have a
              certain character.
            </li>
            <li>If you successfully challenge someone, they lose influence.</li>
            <li>If your challenge fails, you lose influence and they exchange their card.</li>
            <li>You can block certain actions if you claim to have the appropriate character.</li>
            <li>When you lose all your influence (cards), you're eliminated from the game.</li>
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default HowToPlay
