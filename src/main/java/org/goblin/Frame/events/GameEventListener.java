package org.goblin.Frame.events;

import org.goblin.Pieces.Piece;

public interface GameEventListener {
    void onGameOver(String message);
    int onPromotionRequested(Piece pawn);
}
