package org.goblin.Frame;

import org.goblin.Pieces.Piece;

public interface GameEventListener {
    void onGameOver(String message);
    int onPromotionRequested(Piece pawn);
}
